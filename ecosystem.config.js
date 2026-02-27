module.exports = {
    apps: [
      {
        name: 'ehr-backend',        // Nombre del proceso
        script: 'server.js',        // Archivo principal de tu aplicación
        env: {
          NODE_ENV: 'development',   // Entorno (producción o desarrollo)
          DB_NAME: 'ehr_system',
          DB_USER: 'postgres',
          DB_PASS: '12345',
          DB_HOST: 'localhost',
          DB_PORT: 5432,
          PORT: 3000,
        },
      },
    ],
  };
  