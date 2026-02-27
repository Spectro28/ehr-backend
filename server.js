const express = require('express');
const cors = require('cors');
const db = require('./models');  // Cambia esta línea
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const authController = require('./controllers/authController');
const { authenticateToken } = require('./middleware/auth.middleware');
const patientRoutes = require('./routes/patientRoutes');
const consultorioRoutes = require('./routes/consultorioRoutes');
const citaRoutes = require('./routes/citaRoutes');
const vitalSignsRoutes = require('./routes/vital-signsRoutes');
const evolucionRoutes = require('./routes/evolucionRoutes');
const prescripcionRoutes = require('./routes/prescripcionRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const catalogosRoutes = require('./routes/catalogosRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const odontogramaRoutes = require('./routes/odontogramaRoutes');
const examenFisicoRoutes = require('./routes/api/examen-fisico');
const debugRoutes = require('./routes/debugRoutes');
const especialidadesRoutes = require('./routes/especialidadesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors({
  origin: [
     'http://localhost:4200',
     'http://localhost:4000',
     'http://161.97.106.243',
     'https://161.97.106.243',
     'http://coidhex.com',
     'https://coidhex.com',
     'http://www.coidhex.com',
     'https://www.coidhex.com'
      ],
  credentials: true
}));
app.use(express.json());


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/ubicacion', ubicacionRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/consultorios', consultorioRoutes);
app.use('/api/vital-signs', vitalSignsRoutes);
app.use('/api/evoluciones', evolucionRoutes);
app.use('/api/prescripciones', prescripcionRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/odontograma', odontogramaRoutes);
app.use('/api/examen-fisico', examenFisicoRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});
app.use('/api/admin', authenticateToken, adminRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

async function startServer() {
  try {
    // Verificar conexión
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sincronizar modelos
    await db.sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada');

    // Crear usuario admin inicial
    await authController.createInitialAdmin();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Inicializar roles
require('./config/initRoles')().then(() => {
    console.log('✅ Roles inicializados correctamente');
    
    // Iniciar el servidor
    startServer();
}).catch(error => {
    console.error('❌ Error al inicializar roles:', error);
    process.exit(1);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});