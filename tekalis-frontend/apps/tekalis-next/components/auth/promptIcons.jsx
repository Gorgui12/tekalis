/**
 * components/auth/promptIcons.jsx
 *
 * Correspondance entre les clés d'icônes utilisées dans
 * lib/authPrompt.js (PROMPT_REASONS) et les icônes react-icons.
 * Extraite pour être partagée par la carte inline (AuthPromptCard)
 * et la modale automatique (AuthPromptModal).
 */

import {
  FaBell,
  FaBolt,
  FaBox,
  FaHeadset,
  FaHeart,
  FaShieldAlt,
  FaShoppingCart,
  FaTruck,
  FaUser,
} from "react-icons/fa";

export const PROMPT_ICONS = {
  bolt:    <FaBolt className="text-brand-500" />,
  truck:   <FaTruck className="text-brand-500" />,
  shield:  <FaShieldAlt className="text-emerald-500" />,
  bell:    <FaBell className="text-amber-500" />,
  headset: <FaHeadset className="text-brand-500" />,
  cart:    <FaShoppingCart className="text-brand-500" />,
  heart:   <FaHeart className="text-rose-500" />,
  box:     <FaBox className="text-brand-500" />,
  user:    <FaUser className="text-brand-500" />,
};