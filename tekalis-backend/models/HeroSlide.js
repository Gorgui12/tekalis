const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  description: { type: String, trim: true },
  badge: { type: String, trim: true },
  image: { type: String, required: true }, // URL image background
  mobileImage: { type: String }, // Image optimisée mobile
  overlay: { type: String, default: 'rgba(0,0,0,0.45)' }, // couleur overlay
  gradient: { type: String, default: '' }, // ex: 'from-blue-600 to-purple-600'
  primaryCta: {
    text: { type: String, required: true },
    link: { type: String, required: true },
    style: { type: String, enum: ['primary', 'white', 'outline'], default: 'white' }
  },
  secondaryCta: {
    text: { type: String },
    link: { type: String },
    style: { type: String, enum: ['outline', 'ghost'], default: 'outline' }
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  textPosition: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
  textColor: { type: String, default: 'white' },
  // Stats ou badges optionnels affichés sur le slide
  stats: [{
    value: String,
    label: String
  }],
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
