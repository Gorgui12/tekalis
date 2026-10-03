// ===============================================
// services/emailQueue.js — File d'attente persistante
//
// Reprend les envois en échec. Les emails sont déclenchés APRÈS la réponse
// HTTP, donc un SMTP momentanément indisponible ne doit pas coûter un email
// (confirmation de commande, réinitialisation de mot de passe) : le message
// est conservé en base et rejoué plus tard.
//
// Choix : MongoDB via le modèle EmailQueue, pas Redis/BullMQ. Un store de
// plus à exploiter, à sauvegarder et à surveiller n'est pas justifié ici, et
// ce choix garantit que la reprise survit à un redémarrage du serveur.
//
// Backoff exponentiel : 1 min, 2 min, 4 min, 8 min... plafonné. Une panne
// SMTP de plusieurs minutes ne déclenche pas une rafale d'essais.
// ===============================================
const EmailQueue = require("../models/EmailQueue");
const mailer = require("./mailer");

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 60 * 1000; // 1 minute
const MAX_DELAY_MS = 30 * 60 * 1000; // 30 minutes
const BATCH_SIZE = 20;

// Une exécution à la fois : deux balayeurs concurrents retraiterait le même
// document et enverrait le message en double.
let _sweeping = false;
let _timer = null;

// 1min, 2min, 4min, 8min, 16min… plafonné à MAX_DELAY_MS.
const backoffFor = (attempts) =>
  Math.min(BASE_DELAY_MS * Math.pow(2, Math.max(0, attempts - 1)), MAX_DELAY_MS);

// ── Envoi d'un document de la file ────────────────────────────────────────────
const deliver = async (job) => {
  try {
    const info = await mailer.getTransporter().sendMail({
      from: job.from,
      to: job.to,
      subject: job.subject,
      html: job.html,
      text: job.text,
      replyTo: job.replyTo,
      attachments: job.attachments,
      headers: job.headers
    });

    job.status = "sent";
    job.sentAt = new Date();
    job.messageId = info.messageId;
    job.lastError = undefined;
    await job.save();

    console.log(`📧 Email rejoué avec succès: ${info.messageId} → ${job.to}`);
    return true;
  } catch (error) {
    job.attempts += 1;
    job.lastError = error.message;

    if (mailer.isPermanentError(error) || job.attempts >= MAX_ATTEMPTS) {
      job.status = "failed";
      console.error(
        `❌ Email définitivement en échec (${job.attempts}/${MAX_ATTEMPTS}) → ${job.to}:`,
        error.message
      );
    } else {
      job.status = "pending";
      job.nextAttemptAt = new Date(Date.now() + backoffFor(job.attempts));
      console.warn(
        `⏳ Email en attente de reprise (tentative ${job.attempts}/${MAX_ATTEMPTS}, ` +
        `prochain essai ${job.nextAttemptAt.toISOString()}) → ${job.to}`
      );
    }

    await job.save();
    return false;
  }
};

// ── Balayage ──────────────────────────────────────────────────────────────────
const flush = async (limit = BATCH_SIZE) => {
  if (_sweeping) return { skipped: true };
  if (!mailer.isEmailConfigured()) return { skipped: true };

  _sweeping = true;
  let processed = 0;

  try {
    const due = await EmailQueue.find({
      status: "pending",
      nextAttemptAt: { $lte: new Date() }
    })
      .sort({ nextAttemptAt: 1 })
      .limit(limit);

    for (const job of due) {
      await deliver(job);
      processed += 1;
    }

    if (processed > 0) {
      console.log(`🔁 File email : ${processed} message(s) repris`);
    }
    return { processed };
  } catch (error) {
    // La base peut être indisponible au tout démarrage : on ne casse pas le
    // boot pour autant, le balayeur suivant réessaiera.
    console.error("⚠️ Balayage de la file email impossible:", error.message);
    return { error: error.message };
  } finally {
    _sweeping = false;
  }
};

// ── Cycle de vie ──────────────────────────────────────────────────────────────
const start = () => {
  if (_timer) return;

  _timer = setInterval(() => {
    flush().catch(() => {});
  }, 60 * 1000);

  // Ne doit pas maintenir le process Node en vie à l'arrêt (tests, scripts).
  _timer.unref();

  // Reprise immédiate au démarrage : c'est le principal bénéfice de la
  // persistance, sinon les messages attendraient un balayage complet.
  setTimeout(() => {
    flush().catch(() => {});
  }, 5000).unref();

  console.log("⏱️  Balayeur de la file email démarré (toutes les 60 s)");
};

const stop = () => {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
};

// ── API publique ──────────────────────────────────────────────────────────────
const enqueue = async (mail) => {
  try {
    const job = await EmailQueue.create({
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      from: mail.from,
      replyTo: mail.replyTo,
      attachments: mail.attachments,
      headers: mail.headers,
      status: "pending",
      attempts: 0,
      nextAttemptAt: new Date()
    });

    console.log(`📥 Email mis en file (id ${job._id}) → ${mail.to}`);
    return { success: true, queued: true, id: job._id };
  } catch (error) {
    console.error("❌ Impossible d'empiler l'email en base:", error.message);
    return { success: false, queued: false, error: error.message };
  }
};

const stats = async () =>
  EmailQueue.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } }
  ]);

module.exports = {
  enqueue,
  flush,
  start,
  stop,
  stats,
  MAX_ATTEMPTS,
  backoffFor
};