const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ehr_system', 'postgres', '12345', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida correctamente.');
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });

    
    