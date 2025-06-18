const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const empresasPermitidas = ['CARDIOVASC', 'INVITROMED', 'Empresa 3'];
const User = db.User;

exports.register = async (req, res) => {

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const { username, role, especialidad, empresa, email , identification} = req.body; // Agregamos especialidad
      
      // Validaciones
    if (!username || !role || !empresa || !email ||!identification) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos' });
    }

    if (role === 'doctor' && !especialidad) {
      return res.status(400).json({ message: 'La especialidad es requerida para el rol de doctor' });
    }

    if (role === 'doctor' && !especialidadesValidas.includes(especialidad)) {
      return res.status(400).json({ message: 'Especialidad no válida para doctores' });
    }

    if (!empresasPermitidas.includes(empresa)) {
      return res.status(400).json({ message: 'Empresa no válida' });
    }
      // Validación de especialidad válida para doctores
      if (role === 'doctor') {
        const especialidadesValidas = [
          'Cardiologia Adultos',
          'Cardiologia Pediatrica',
          'Angiologia',
          'Nefrologia',
          'Endocrinologia',
          'Medicina Interna',
          'Nutricion',
          'Geriatria'
        ];
        
        if (!especialidadesValidas.includes(especialidad)) {
          return res.status(400).json({ 
            message: 'Especialidad no válida' 
          });
        }
      }
  
      const user = await User.create({
        id:12, 
        username,
        password: hashedPassword,
        role,
        especialidad: role === 'doctor' ? especialidad : null, // Solo guardamos especialidad para doctores
        empresa,
        email,
        cedula: identification
      });
  
      res.status(200).json({ 
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          especialidad: user.especialidad,
          empresa: user.empresa,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  };
  
  exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }
  
      const validRoles = ['administrador', 'doctor', 'secretaria', 'enfermera', 'paciente'];
      if (!validRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Los roles válidos son: administrador, doctor, secretaria, enfermera' 
        });
      }
  
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          especialidad: user.especialidad, // Incluimos especialidad en el token
          empresa: user.empresa
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          especialidad: user.especialidad,
          empresa: user.empresa
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  };

  exports.createUser = async (req, res) => {
    try {
        const { username, password, role, especialidad, empresa } = req.body;  // Agregamos especialidad

        if (!username || !password || !role || !empresa) {
          return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos' });
        }

        // Validar que el rol sea válido
        const validRoles = ['administrador', 'doctor', 'secretaria', 'enfermera'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rol no válido. Los roles permitidos son: administrador, doctor, secretaria, enfermera'
            });
        }

        // Validación para doctores
        if (role === 'doctor') {
            if (!especialidad) {
                return res.status(400).json({
                    success: false,
                    message: 'La especialidad es requerida para usuarios con rol de doctor'
                });
            }

            // Lista de especialidades válidas
            const especialidadesValidas = [
                'Cardiologia Adultos',
                'Cardiologia Pediatrica',
                'Angiologia',
                'Nefrologia',
                'Endocrinologia',
                'Medicina Interna',
                'Nutricion',
                'Geriatria'
            ];

            if (!especialidadesValidas.includes(especialidad)) {
                return res.status(400).json({
                    success: false,
                    message: 'Especialidad no válida'
                });
            }
        }

        if (!empresasPermitidas.includes(empresa)) {
          return res.status(400).json({ message: 'Empresa no válida' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        // Crear el nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
            role,
            especialidad: role === 'doctor' ? especialidad : null,
            empresa
        });

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                especialidad: user.especialidad,
                empresa: user.empresa
            }
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message
        });
    }
};

// También actualiza el método getAllUsers para incluir la especialidad
exports.getAllUsers = async (req, res) => {
  try {
      const users = await User.findAll({
          attributes: ['id', 'username', 'role', 'active', 'especialidad', 'empresa','created_at']
      });
      res.json(users);  // Simplificado para coincidir con lo que espera el frontend
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error al obtener usuarios',
          error: error.message
      });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
      const { role } = req.params;
      const users = await User.findAll({
          where: { role },
          attributes: ['id', 'username', 'active', 'created_at']
      });
      res.json({
          success: true,
          users
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error al obtener usuarios por rol',
          error: error.message
      });
  }
};
