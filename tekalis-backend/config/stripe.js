// ===============================================
// config/stripe.js
// ✅ FIX : lazy init — Stripe n'est instancié que si
//    STRIPE_SECRET_KEY est défini, évite le crash au
//    require() si la var est absente du .env
// ===============================================

// Vérifier si Stripe est configuré
const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

// Instance Stripe (lazy init)
let _stripe = null;

const getStripe = () => {
  if (_stripe) return _stripe;

  if (!isStripeConfigured()) {
    throw new Error(
      "Stripe non configuré. Définissez STRIPE_SECRET_KEY dans .env"
    );
  }

  _stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  return _stripe;
};

// Log au démarrage sans bloquer ni crasher
if (isStripeConfigured()) {
  console.log("✅ Stripe configuré");
} else {
  console.warn("⚠️  Stripe non configuré (STRIPE_SECRET_KEY absent) — paiements carte désactivés");
}

// Créer un PaymentIntent
const createPaymentIntent = async (amount, currency = "xof", metadata = {}) => {
  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      }
    });
    return paymentIntent;
  } catch (error) {
    console.error("Erreur création PaymentIntent:", error);
    throw error;
  }
};

// Créer une session Checkout
const createCheckoutSession = async (lineItems, metadata = {}) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata,
      shipping_address_collection: {
        allowed_countries: ["SN", "FR", "US"]
      }
    });
    return session;
  } catch (error) {
    console.error("Erreur création session:", error);
    throw error;
  }
};

// Vérifier un paiement
const verifyPayment = async (paymentIntentId) => {
  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Erreur vérification paiement:", error);
    throw error;
  }
};

// Créer un remboursement
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount) : undefined
    });
    return refund;
  } catch (error) {
    console.error("Erreur création remboursement:", error);
    throw error;
  }
};

// Webhook handler
const handleWebhook = (rawBody, signature) => {
  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error("Erreur webhook:", error);
    throw error;
  }
};

module.exports = {
  isStripeConfigured,
  createPaymentIntent,
  createCheckoutSession,
  verifyPayment,
  createRefund,
  handleWebhook
};