"use client";

/**
 * lib/googleIdentity.js — chargement du SDK Google Identity Services.
 *
 * Le SDK s'injecte via une balise <script> globale. On ne le charge qu'une
 * seule fois par session et on renvoie toujours la même promesse, afin que
 * plusieurs composants (bouton, signup modal) ne déclenchent pas de
 * téléchargements concurrents.
 *
 * Aucune clé secrète ici : NEXT_PUBLIC_GOOGLE_CLIENT_ID est un identifiant
 * public, présent dans le balisage de la page. La vraie validation du
 * jeton se fait côté serveur (authController.googleLogin).
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";

// Lit la variable au moment de l'appel (et pas au chargement du module) :
// les variables NEXT_PUBLIC sont injectées à la compilation, on veut surtout
// éviter de capturer `undefined` dans un module évalué côté serveur.
const getClientId = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

let scriptPromise = null;

function injectScript() {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Identity ne peut être chargé que dans le navigateur"));
      return;
    }
    if (window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }

    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      // Script déjà présent (navigation Previous/Next) : on attend l'événement.
      existing.addEventListener("load", () => resolve(window.google.accounts.id));
      existing.addEventListener("error", () =>
        reject(new Error("Échec du chargement du SDK Google"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.accounts.id);
    script.onerror = () => reject(new Error("Échec du chargement du SDK Google"));
    document.head.appendChild(script);
  });

  // En cas d'échec, on permet une nouvelle tentative au prochain rendu.
  scriptPromise.catch(() => { scriptPromise = null; });
  return scriptPromise;
}

/**
 * Charge le SDK Google Identity Services.
 * @returns {Promise<{clientId: string, id: object}>}
 */
export async function initGoogleIdentity() {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID non configuré");
  }
  const google = await injectScript();
  return { clientId, id: google };
}

export function isGoogleConfigured() {
  return !!getClientId();
}
