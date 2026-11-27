const mongoose = require("mongoose");
const crypto = require("crypto");

const quoteRequestSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    unique: true,
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 30,
    default: ""
  },
  message: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ""
  },
  source: {
    type: String,
    enum: ["web", "solar"],
    default: "web"
  },
  solarSummary: {
    type: String,
    trim: true,
    maxlength: 4000,
    default: ""
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    lineTotal: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  validUntil: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  status: {
    type: String,
    enum: ["pending", "sent", "accepted", "rejected", "converted", "cancelled"],
    default: "pending"
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ["pending", "sent", "accepted", "rejected", "converted", "cancelled"]
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    data: {
      type: String,
      select: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const generateQuoteNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `DEV-${year}-${month}-${randomSuffix}`;
};

quoteRequestSchema.statics.generateQuoteNumber = generateQuoteNumber;

quoteRequestSchema.pre("validate", function(next) {
  if (!this.quoteNumber) this.quoteNumber = generateQuoteNumber();
  if (!this.statusHistory.length) {
    this.statusHistory.push({ status: this.status, updatedAt: new Date() });
  }
  next();
});

quoteRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("QuoteRequest", quoteRequestSchema);
