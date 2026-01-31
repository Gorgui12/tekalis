// ===============================================
// 17. config/stripe.js
// ===============================================
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Créer une session de paiement
const createPaymentIntent = async (amount, currency = "xof", metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // En centimes
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
  stripe,
  createPaymentIntent,
  createCheckoutSession,
  verifyPayment,
  createRefund,
  handleWebhook
};
