const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.js');

// Importar los modelos existentes
const UserModel = require('./user');
const PatientModel = require('./patient');
const ConsultorioModel = require('./consultorio');
const HorarioConsultorioModel = require('./horarioConsultorio');
const CitaModel = require('./cita');
const VitalSignsModel = require('./vital-signs');
const EvolucionModel = require('./evolucion');
const PrescripcionModel = require('./prescripcion');
const ProvinciaModel = require('./provincia');
const CantonModel = require('./canton');
const ParroquiaModel = require('./parroquia');
const MedicamentoModel = require('./Medicamento');

// Importar los nuevos modelos
const CIEModel = require('./cie');
const DiagnosticoModel = require('./diagnostico');

// Inicializar Sequelize
const sequelize = dbConfig.sequelize;

const db = {};

// Agregar sequelize a db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Definir los modelos
db.User = UserModel(sequelize, DataTypes);
db.Patient = PatientModel(sequelize, DataTypes);
db.Consultorio = ConsultorioModel(sequelize, DataTypes);
db.HorarioConsultorio = HorarioConsultorioModel(sequelize, DataTypes);
db.Cita = CitaModel(sequelize, DataTypes);
db.VitalSigns = VitalSignsModel(sequelize, DataTypes);
db.Evolucion = EvolucionModel(sequelize, DataTypes);
db.Prescripcion = PrescripcionModel(sequelize, DataTypes);
db.Provincia = ProvinciaModel(sequelize, DataTypes);
db.Canton = CantonModel(sequelize, DataTypes);
db.Parroquia = ParroquiaModel(sequelize, DataTypes);
db.Medicamento = MedicamentoModel(sequelize, DataTypes);

// Agregar los nuevos modelos
db.CIE = CIEModel(sequelize, DataTypes);
db.Diagnostico = DiagnosticoModel(sequelize, DataTypes);

// Ejecutar los métodos associate de cada modelo
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;