// autogest-app/backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: "backend",
    script: "./index.js",
    ignore_watch: [".env"],
    env_production: {
      NODE_ENV: "production",
      DB_HOST: "localhost",
      DB_USER: "autogest_user",
      DB_PASSWORD: "cr18r4t10N_hu85_4Mpull43_v1nt_200Ph0814_wld_ch4Ml3t_d1R3r_unl1nE_80rd4r",
      DB_NAME: "autogest_db",
      // --- INICIO DE LA MODIFICACIÓN ---
      DB_DIALECT: "mysql", // <-- Esta es la línea que faltaba
      // --- FIN DE LA MODIFICACIÓN ---
      JWT_SECRET: "%W5z7%NPvr2gMGzBDB14hEfY!kYKS%*Q5PBExM5Zbev3!U5Jdn&T9uGQ8Ez!q9sx",
      STRIPE_SECRET_KEY_LIVE: "sk_live_TU_CLAVE_SECRETA_DE_PRODUCCION",
      STRIPE_PRICE_ID_LIVE: "price_TU_PRICE_ID_DE_PRODUCCION",
      STRIPE_WEBHOOK_SECRET_LIVE: "whsec_TU_WEBHOOK_SECRET_DE_PRODUCCION"
    }
  }]
}