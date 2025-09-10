// autogest-app/backend/ecosystem.config.js
module.exports = {
  apps : [{
    name   : "backend",
    script : "./index.js",
    // --- INICIO DE LA MODIFICACIÓN ---
    // Ignorar el fichero .env en producción para evitar conflictos
    ignore_watch: [".env"],
    // --- FIN DE LA MODIFICACIÓN ---
    env_production: {
       NODE_ENV: "production",
       // --- Configuración de la Base de Datos de PRODUCCIÓN ---
       DB_HOST: "localhost",
       DB_USER: "autogest_user",
       DB_PASSWORD: "cr18r4t10N_hu85_4Mpull43_v1nt_200Ph0814_w3ld_ch4Ml3t_d1R3r_unl1nE_80rd4r",
       DB_NAME: "autogest_db",
       // ... aquí puedes añadir el resto de variables de producción
    }
  }]
}