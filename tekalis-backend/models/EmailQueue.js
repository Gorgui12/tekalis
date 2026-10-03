// ===============================================
// models/EmailQueue.js
// File d'attente d'emails persistante.
//
// Pourquoi une collection plutôt qu'un simple retry en mémoire : un envoi est
// déclenché APRÈS la réponse HTTP (fire-and-forget). Si le process meurt entre
// la commande enregistrée et l'email parti — redéploiement, OOM, nodemon — le
// retry en mémoire est perdu avec lui. Ici l'email survit au redémarrage et
// repart au prochain démarrage du serveur.
//
// Les emails qui échouent étaient, avant ce mécanisme, perdus sans autre trace
// qu'une ligne dans la console du serveur. Ce modèle est aussi cet historique :
// un support peut répondre « avez-vous reçu le mail ? » en consultant status.
// ===============================================
const mongoose = require("mongoose");

const emailQueueSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      index: true
    },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    // Partie texte déjà calculée : la dériver au moment de la reprise ferait
    // dépendre le contenu envoyé d'une variable d'environnement qui a pu
    // changer depuis (FRONTEND_URL, SITE_NAME...). On fige ce qui part.
    text: String,
    from: String,
    replyTo: String,
    headers: { type: mongoose.Schema.Types.Mixed },
    // Pièces jointes : on les rejoue à l'identique, donc on stocke la
    // description et le contenu déjà en base64.
    attachments: { type: mongoose.Schema.Types.Mixed },

    // ── État ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true
    },
    attempts: { type: Number, default: 0 },
    // Backoff exponentiel : on ne retentera pas avant cette date.
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    lastError: String,
    messageId: String,
    sentAt: Date
  },
  { timestamps: true }
);

//requête du balayeur : pending dont l'heure de retry est dépassée
emailQueueSchema.index({ status: 1, nextAttemptAt: 1 });

// Purge automatique des emails envoyés : on ne garde pas indéfiniment le
// corps HTML de toutes les commandes. TTL aligné sur la valeur d'EXPIRATION
// configurée dans le service.
emailQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

module.exports = mongoose.model("EmailQueue", emailQueueSchema);