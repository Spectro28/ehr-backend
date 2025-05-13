module.exports = {
    apps: [
      {
        name: 'ehr-backend',        // Nombre del proceso
        script: 'server.js',        // Archivo principal de tu aplicación
        env: {
          NODE_ENV: 'production',   // Entorno (producción o desarrollo)
          DB_NAME: 'railway',
          DB_USER: 'postgres',
          DB_PASS: 'GooUsTRAXEbloxDsrFiUBzTjDPTfpVDe',
          DB_HOST: 'mainline.proxy.rlwy.net',
          DB_PORT: 39590,
          PORT: 3000,
        },
      },
    ],
  };
  