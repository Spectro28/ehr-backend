const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.js');

// Inicializar Sequelize
const sequelize = dbConfig.sequelize;
const db = {};

// Agregar sequelize a db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Importar todos los modelos primero
const modelDefiners = {
  Role: require('./role'),
  User: require('./user'),
  UserRole: require('./userRole'),
  Patient: require('./patient'),
  Consultorio: require('./consultorio'),
  HorarioConsultorio: require('./horarioConsultorio'),
  Cita: require('./cita'),
  VitalSigns: require('./vital-signs'),
  Evolucion: require('./evolucion'),
  Prescripcion: require('./prescripcion'),
  Provincia: require('./provincia'),
  Canton: require('./canton'),
  Parroquia: require('./parroquia'),
  Medicamento: require('./Medicamento'),
  MedicamentoComercial: require('./medicamentoComercial'),
  DeletedUser: require('./deletedUser'),
  CIE: require('./cie'),
  Diagnostico: require('./diagnostico'),
  Odontograma: require('./odontograma'),
  PiezaOdontograma: require('./piezaOdontograma'),
  IndiceOdontograma: require('./indiceOdontograma'),
  Procedimiento: require('./procedimiento'),
  DiagnosticoOdontograma: require('./diagnosticoOdontograma'),
  ProcedimientoOdontograma: require('./procedimientoOdontograma'),
  BodyPart: require('./bodyPart'),
  LesionCatalog: require('./lesionCatalog'),
  ExamenFisico: require('./examenFisico'),
  ExamenFisicoItem: require('./examenFisicoItem'),
  ExamenFisicoItemLesion: require('./examenFisicoItemLesion')
};

// Inicializar todos los modelos
for (const modelName in modelDefiners) {
  db[modelName] = modelDefiners[modelName](sequelize, DataTypes);
}

// Ejecutar los métodos associate de cada modelo
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`Ejecutando associate para ${modelName}`);
    db[modelName].associate(db);
  }
});

console.log('Asociaciones cargadas. Verificando Evolucion associations:', db.Evolucion.associations ? Object.keys(db.Evolucion.associations) : 'NO ENCONTRADAS');

module.exports = db;