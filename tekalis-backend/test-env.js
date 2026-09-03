// test-env.js - Script de vérification de la configuration
require('dotenv').config();

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   VÉRIFICATION CONFIGURATION TEKALIS       ║');
console.log('╚════════════════════════════════════════════╝\n');

const checks = {
  '🌍 Environnement': {
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT
  },
  '🗄️  Base de données': {
    'MONGODB_URI': process.env.MONGODB_URI ? '✅ Configuré' : '❌ Manquant'
  },
  '🔐 JWT': {
    'JWT_SECRET': process.env.JWT_SECRET ? '✅ Configuré' : '❌ Manquant',
    'JWT_EXPIRE': process.env.JWT_EXPIRE
  },
  '📧 Email': {
    'EMAIL_HOST': process.env.EMAIL_HOST,
    'EMAIL_USER': process.env.EMAIL_USER ? '✅ Configuré' : '❌ Manquant'
  },
  '🌐 URLs': {
    'FRONTEND_URL': process.env.FRONTEND_URL,
    'BACKEND_URL': process.env.BACKEND_URL
  },
  '💳 PayDunya': {
    'Mode': process.env.PAYDUNYA_MODE || '❌ Non défini',
    'Master Key': process.env.PAYDUNYA_MASTER_KEY ? 
      (process.env.PAYDUNYA_MASTER_KEY.includes('wQzk9ZwR') ? 
        '⚠️  Clé d\'exemple (à remplacer)' : '✅ Configuré') : 
      '❌ Manquant',
    'Private Key': process.env.PAYDUNYA_PRIVATE_KEY ? 
      (process.env.PAYDUNYA_PRIVATE_KEY.includes('test_private_rMId') ? 
        '⚠️  Clé d\'exemple (à remplacer)' : '✅ Configuré') : 
      '❌ Manquant',
    'Public Key': process.env.PAYDUNYA_PUBLIC_KEY ? '✅ Configuré' : '❌ Manquant',
    'Token': process.env.PAYDUNYA_TOKEN ? '✅ Configuré' : '❌ Manquant'
  },
  '🏪 Magasin': {
    'Nom': process.env.STORE_NAME,
    'Téléphone': process.env.STORE_PHONE,
    'Ville': process.env.STORE_ADDRESS
  }
};

for (const [category, values] of Object.entries(checks)) {
  console.log(`\n${category}`);
  console.log('─'.repeat(50));
  for (const [key, value] of Object.entries(values)) {
    const displayValue = value || '❌ Non défini';
    console.log(`  ${key.padEnd(20)} : ${displayValue}`);
  }
}

console.log('\n╔════════════════════════════════════════════╗');
console.log('║              AVERTISSEMENTS                ║');
console.log('╚════════════════════════════════════════════╝\n');

const warnings = [];

// Vérifier les clés PayDunya
if (process.env.PAYDUNYA_MASTER_KEY && process.env.PAYDUNYA_MASTER_KEY.includes('wQzk9ZwR')) {
  warnings.push('⚠️  Vous utilisez les clés PayDunya d\'EXEMPLE de la documentation');
  warnings.push('   → Connectez-vous sur https://paydunya.com');
  warnings.push('   → Menu "Intégrez notre API" → "Configurer une application"');
  warnings.push('   → Copiez VOS clés dans le fichier .env\n');
}

// Vérifier le mode PayDunya
if (process.env.PAYDUNYA_MODE === 'live') {
  warnings.push('⚠️  Mode PayDunya: LIVE (Production)');
  warnings.push('   → Assurez-vous d\'avoir les bonnes clés de production\n');
}

// Vérifier MongoDB
if (!process.env.MONGODB_URI) {
  warnings.push('❌ MongoDB URI manquant - L\'application ne pourra pas se connecter\n');
}

// Vérifier JWT
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'superSecretKey123') {
  warnings.push('⚠️  JWT_SECRET est la valeur par défaut');
  warnings.push('   → Changez-la pour la production\n');
}

if (warnings.length > 0) {
  warnings.forEach(w => console.log(w));
} else {
  console.log('✅ Aucun avertissement - Configuration OK!\n');
}

console.log('╔════════════════════════════════════════════╗');
console.log('║          PROCHAINES ÉTAPES                 ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('1. Si vous voyez des ⚠️  ou ❌, corrigez-les dans .env');
console.log('2. Obtenez vos vraies clés PayDunya sur https://paydunya.com');
console.log('3. Installez les dépendances: npm install');
console.log('4. Créez les fichiers controllers/paymentController.js');
console.log('5. Créez les fichiers routes/paymentRoutes.js');
console.log('6. Redémarrez le serveur: npm start\n');

console.log('💡 Pour tester les paiements en mode TEST:');
console.log('   Numéro: 221700000001');
console.log('   Code PIN: 1234\n');