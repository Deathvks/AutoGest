// autogest-app/backend/ecosystem.config.js
module.exports = {
  apps : [{
    name   : "backend",
    script : "./index.js",
    env_production: {
       NODE_ENV: "production",
       // --- Configuración de la Base de Datos de PRODUCCIÓN ---
       DB_HOST: "localhost",
       DB_USER: "autogest_user",
       DB_PASSWORD: "aqxt9m!$CEufWrcsSe2!YhLLUvG8ReBEBDqWM@acWsqbWJTR2d5C#JKaCgJ^Ag&f",
       DB_NAME: "autogest_db",
       // ... aquí puedes añadir el resto de variables de producción
    }
  }]
}