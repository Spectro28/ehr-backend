const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

const empresasPermitidas = ['CARDIOVASC', 'INVITROMED', 'Centro de Especialidades Médicas Prado Gómez', 'COIDHEX'];

const userController = {
  register: async (req, res) => {
    try {
      const { username, password, role, especialidad, empresa, tipo_identificacion, identificacion, email } = req.body;

      // Validaciones básicas
      if (!username || !password || !role || !empresa || !tipo_identificacion || !identificacion || !email) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos' });
      }

            // Lista de roles válidos
      const validRoles = ['administrador', 'doctor', 'dentista', 'secretaria', 'enfermera'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol no válido' });
      }

      // Lista de especialidades válidas
      const especialidadesValidas = [
        'Acupuntura',
        'Alergología',
        'Anatomía Patológica',
        'Anestesiología',
        'Atención Primaria en Salud',
        'Audiología / Foniatría',
        'Biología Molecular',
        'Bioquímica',
        'Cardiología',
        'Cirugía Cardíaca',
        'Cirugía Cardiotoráxica',
        'Cirugía Cardiovascular',
        'Cirugía de Cabeza y Cuello',
        'Cirugía General',
        'Cirugía Ortopédica Y Traumatología',
        'Cirugía Pediátrica',
        'Cirugía Plástica y Reconstructiva',
        'Cirugía Torácica',
        'Cirugía Vascular y Endovascular',
        'Dermatología',
        'Endocrinología',
        'Epidemiología, Medicina Tropical',
        'Especialista en Enfermedades Transmisibles y Epidemiología',
        'Fisiatría',
        'Gastroenterología',
        'Genética Clínica',
        'Genética Médica',
        'Gerencia en Administración Hospitalaria',
        'Geriatría y Gerontología',
        'Ginecología y Obstetricia',
        'Hematología',
        'Homeopatía',
        'Imagenología y Diagnóstico por imagen',
        'Infectología',
        'Inmunología',
        'Inmunología Clínica',
        'Laboratorio Clínico e Histopatológico',
        'Medicina Forense, Medicina Legal',
        'Medicina Aeroespacial',
        'Medicina Crítica',
        'Medicina De Emergencia',
        'Medicina Del Deporte',
        'Medicina Del Trabajo, Medicina Ocupacional',
        'Medicina Familiar Y Comunitaria',
        'Medicina General Integral',
        'Medicina Interna',
        'Medicina Nuclear',
        'Microbiología',
        'Nefrología',
        'Neumología',
        'Neurocirugía',
        'Neurofisiología Clínica',
        'Neurología',
        'Neuropsicología',
        'Neuropediatría',
        'Nutrición',
        'Nutrición Clínica',
        'Obstetricia',
        'Obstetricia Rural',
        'Odontología',
        'Odontologia Rural',
        'Oftalmología',
        'Oncología',
        'Otorrinolaringología',
        'Parasitología',
        'Patología Clínica',
        'Pediatría',
        'Proctología',
        'Psicología Clínica',
        'Psicorehabilitador',
        'Psiquiatría',
        'Psiquiatría Infantil y del Adolescente',
        'Reumatología',
        'Salud Pública',
        'Subespecialidad',
        'Terapia Neural',
        'Ultrasonido',
        'Urología',
        'Enfermería',
        'Auxiliar de Enfermería',
        'Enfermería Rural',
        'Medicina Rural',
        'Medicina General',
        'Vigilancia de la Salud',
        'Estimulación Temprana'
      ];

      // Validación para doctores y dentistas
      if (role === 'doctor' || role === 'dentista') {
        if (!especialidad) {
          return res.status(400).json({ message: 'La especialidad es requerida para el rol de doctor o dentista' });
        }
        if (!especialidadesValidas.includes(especialidad)) {
          return res.status(400).json({ message: 'Especialidad no válida' });
        }
      }

      if (!empresasPermitidas.includes(empresa)) {
        return res.status(400).json({ message: 'Empresa no válida' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        password: hashedPassword,
        role,
        especialidad: role === 'doctor' ? especialidad : null,
        empresa,
        tipo_identificacion,
        identificacion,
        email
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
  },

  login: async (req, res) => {
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
  
      const validRoles = ['administrador', 'doctor', 'dentista', 'secretaria', 'enfermera'];
      if (!validRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Los roles válidos son: administrador, doctor, dentista, secretaria, enfermera' 
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
  },

  createUser: async (req, res) => {
    try {
      const { username, password, roles, especialidad, empresa, tipo_identificacion, identificacion } = req.body;
        
        // Validar campos obligatorios
        if (!username || !password || !Array.isArray(roles) || roles.length === 0 || !empresa || !tipo_identificacion || !req.body.email) {
          return res.status(400).json({ 
            success: false,
            message: 'Todos los campos obligatorios deben estar completos, incluyendo el correo electrónico y al menos un rol' 
          });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          return res.status(400).json({
            success: false,
            message: 'El formato del correo electrónico no es válido'
          });
        }

        // Validar identificación según el tipo
        if (tipo_identificacion !== 'no_identificado' && !identificacion) {
          return res.status(400).json({
            success: false,
            message: 'El número de identificación es requerido para el tipo de identificación seleccionado'
          });
        }

        // Validar que todos los roles sean válidos
        const validRoles = ['administrador', 'doctor', 'dentista', 'secretaria', 'enfermera'];
        for (const role of roles) {
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: `Rol no válido: ${role}. Los roles permitidos son: administrador, doctor, dentista, secretaria, enfermera`
                });
            }
        }

        // Validar que no se asignen roles de doctor y dentista simultáneamente
        if (roles.includes('doctor') && roles.includes('dentista')) {
            return res.status(400).json({
                success: false,
                message: 'No se puede asignar el rol de doctor y dentista al mismo tiempo'
            });
        }

        // Validación para doctores
        if (roles.includes('doctor') || roles.includes('dentista')) {
            if (!especialidad) {
                return res.status(400).json({
                    success: false,
                    message: 'La especialidad es requerida para usuarios con rol de doctor'
                });
            }

            // Lista de especialidades válidas
            const especialidadesValidas = [
                'Pediatría',
                'Ginecología',
                'Otorrinolaringólogo',
                'Cirugía General',
                'Médico Internista',
                'Urología',
                'Cirujano de Cabeza y Cuello',
                'Geriatra',
                'Coloproctólogo',
                'Dermatología',
                'Cardiología',
                'Neurología',
                'Traumatología',
                'Odontología',
                'Psicología Infantil',
                'Oftalmología',
                'Estimulación Temprana',
                'Obstetricia',
                'Laboratorio Clínico',
                'Medicina General'
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

        // Verificar si el usuario ya existe por username
        const existingUser = await db.User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        // Verificar si el email ya está registrado
        const existingEmail = await db.User.findOne({ where: { email: req.body.email } });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Verificar si la identificación ya existe (solo si no es 'no_identificado')
        if (tipo_identificacion !== 'no_identificado' && identificacion) {
            const existingId = await db.User.findOne({ where: { identificacion } });
            if (existingId) {
                return res.status(400).json({
                    success: false,
                    message: 'El número de identificación ya está registrado'
                });
            }
        }

      // Crear el nuevo usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        username: username.trim(),
        email: req.body.email.trim(),
        password: hashedPassword,
        tipo_identificacion,
        empresa: empresa.trim(),
        especialidad: roles.includes('doctor') ? especialidad.trim() : null,
      };

      // Solo incluir identificacion si no es 'no_identificado'
      if (tipo_identificacion !== 'no_identificado' && identificacion) {
          // Eliminar espacios en blanco y asegurar que sea una cadena
          userData.identificacion = identificacion.toString().trim();
          
          // Validar el formato según el tipo de identificación
          if (tipo_identificacion === 'cedula') {
              if (!/^[0-9]{10}$/.test(userData.identificacion)) {
                  return res.status(400).json({
                      success: false,
                      message: 'La cédula debe tener exactamente 10 dígitos numéricos, sin espacios ni caracteres especiales'
                  });
              }
          }
      }        // Crear el usuario
        const user = await db.User.create(userData);
        
        // Buscar todos los roles en la base de datos
        const roleRecords = await db.Role.findAll({ where: { nombre: roles } });
        
        if (roleRecords.length !== roles.length) {
            await user.destroy(); // Eliminar el usuario si hay error con los roles
            return res.status(400).json({
                success: false,
                message: 'Uno o más roles no fueron encontrados'
            });
        }
        
        // Asignar todos los roles al usuario
        await user.setRoles(roleRecords);
        
        // Obtener el usuario recién creado con sus roles
        const createdUser = await db.User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: db.Role,
                as: 'roles',
                through: { attributes: [] } // No incluir los atributos de la tabla intermedia
            }]
        });
        
        // Asegurarse de que el rol esté disponible en la raíz del objeto de usuario
        const userWithRole = {
            ...createdUser.get({ plain: true }),
            role: roleRecords[0].nombre // Usar el primer rol como rol principal
        };

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: userWithRole
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message
        });
    }
  },

  getAllUsers: async (req, res) => {
    try {
        let whereCondition = { active: true };
        let roleFilter;

        // Si se proporcionan roles específicos en la consulta
        if (req.query.roles) {
            const requestedRoles = req.query.roles.split(',');
            roleFilter = { nombre: { [db.Sequelize.Op.in]: requestedRoles } };
        }

        // Solo mostrar usuarios activos con sus roles
        const users = await db.User.findAll({
            where: whereCondition,
            attributes: [
                'id', 
                'username', 
                'email',
                'role', 
                'active', 
                'especialidad', 
                'empresa',
                'tipo_identificacion',
                'identificacion',
                'created_at'
            ],
            include: [{
                model: db.Role,
                as: 'roles',
                where: roleFilter, // Aplicar el filtro de roles si existe
                through: { attributes: [] }
            }]
        });
        
        // Transformar los datos para incluir roles como array de strings
        const transformedUsers = users.map(user => {
            const plainUser = user.get({ plain: true });
            return {
                ...plainUser,
                roles: plainUser.roles ? plainUser.roles.map(r => r.nombre) : []
            };
        });
        
        res.json({
            success: true,
            data: transformedUsers
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
  },

  getUsersByRole: async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.findAll({
            where: { 
                role,
                active: true // Only return active users
            },
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
  },

  // Soft delete a user
  softDeleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número válido
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Buscar el usuario con sus roles
      const user = await db.User.findByPk(id, {
        include: [
          {
            model: db.Role,
            as: 'roles',
            through: { attributes: [] } // No incluir atributos de la tabla intermedia
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el usuario ya está desactivado
      if (!user.active) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya está desactivado'
        });
      }

        // Verificar registros asociados usando consultas SQL directas
      const consultoriosCount = await db.Consultorio.count({
        where: { doctorId: id }
      });

      const citasPendientesCount = await db.Cita.count({
        where: { 
          doctorId: id,
          estado: ['pendiente', 'confirmada']
        }
      });      // Verificar si tiene registros asociados
      if (consultoriosCount > 0 || citasPendientesCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el usuario porque tiene registros asociados',
          hasConsultorios: consultoriosCount > 0,
          hasCitasPendientes: citasPendientesCount > 0,
          consultoriosCount: consultoriosCount,
          citasPendientesCount: citasPendientesCount
        });
      }

      // Obtener el primer rol del usuario (o un valor por defecto)
      const userRole = user.roles && user.roles.length > 0 ? user.roles[0].nombre : 'sin_rol';

      // Guardar el usuario en la tabla DeletedUsers antes de eliminarlo
      await db.DeletedUser.create({
        original_user_id: user.id,
        username: user.username,
        role: userRole,
        especialidad: user.especialidad,
        empresa: user.empresa,
        email: user.email,
        tipo_identificacion: user.tipo_identificacion,
        identificacion: user.identificacion,
        deleted_at: new Date(),
        deleted_by: req.user.id, // ID del administrador que elimina
        reason: 'Eliminado por administrador'
      });

      // Eliminar todas las asociaciones de roles primero
      await user.setRoles([]);
      
      // Eliminar el usuario de la tabla Users
      await user.destroy();

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente',
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar el usuario',
        error: error.message
      });
    }
  },

  // Toggle user status (activar/desactivar)
  toggleUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número válido
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Buscar el usuario
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Cambiar el estado del usuario
      const newStatus = !user.active;
      await user.update({ 
        active: newStatus,
        updated_at: new Date()
      });

      res.status(200).json({
        success: true,
        message: `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`,
        user: {
          id: user.id,
          username: user.username,
          active: newStatus
        }
      });
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al cambiar el estado del usuario',
        error: error.message
      });
    }
  },

  updateUserBasicInfo: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, tipo_identificacion, identificacion, email, especialidad } = req.body;
      
      // Validar campos requeridos
      if (!username || !tipo_identificacion || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de usuario, tipo de identificación y correo electrónico son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del correo electrónico no es válido'
        });
      }

      // Buscar usuario
      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el nombre de usuario ya existe (excluyendo el usuario actual)
      const existingUsername = await db.User.findOne({
        where: {
          username,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }

      // Verificar si el email ya existe (excluyendo el usuario actual)
      const existingEmail = await db.User.findOne({
        where: {
          email,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      // Verificar identificación si aplica
      if (tipo_identificacion !== 'no_identificado' && identificacion) {
        const existingId = await db.User.findOne({
          where: {
            identificacion,
            id: { [db.Sequelize.Op.ne]: id }
          }
        });
        if (existingId) {
          return res.status(400).json({
            success: false,
            message: 'El número de identificación ya está registrado'
          });
        }
      }

      // Lista de especialidades válidas
      const especialidadesValidas = [
        'Acupuntura',
        'Alergología',
        'Anatomía Patológica',
        'Anestesiología',
        'Atención Primaria en Salud',
        'Audiología / Foniatría',
        'Biología Molecular',
        'Bioquímica',
        'Cardiología',
        'Cirugía Cardíaca',
        'Cirugía Cardiotoráxica',
        'Cirugía Cardiovascular',
        'Cirugía de Cabeza y Cuello',
        'Cirugía General',
        'Cirugía Ortopédica Y Traumatología',
        'Cirugía Pediátrica',
        'Cirugía Plástica y Reconstructiva',
        'Cirugía Torácica',
        'Cirugía Vascular y Endovascular',
        'Dermatología',
        'Endocrinología',
        'Epidemiología, Medicina Tropical',
        'Especialista en Enfermedades Transmisibles y Epidemiología',
        'Fisiatría',
        'Gastroenterología',
        'Genética Clínica',
        'Genética Médica',
        'Gerencia en Administración Hospitalaria',
        'Geriatría y Gerontología',
        'Ginecología y Obstetricia',
        'Hematología',
        'Homeopatía',
        'Imagenología y Diagnóstico por imagen',
        'Infectología',
        'Inmunología',
        'Inmunología Clínica',
        'Laboratorio Clínico e Histopatológico',
        'Medicina Forense, Medicina Legal',
        'Medicina Aeroespacial',
        'Medicina Crítica',
        'Medicina De Emergencia',
        'Medicina Del Deporte',
        'Medicina Del Trabajo, Medicina Ocupacional',
        'Medicina Familiar Y Comunitaria',
        'Medicina General Integral',
        'Medicina Interna',
        'Medicina Nuclear',
        'Microbiología',
        'Nefrología',
        'Neumología',
        'Neurocirugía',
        'Neurofisiología Clínica',
        'Neurología',
        'Neuropsicología',
        'Neuropediatría',
        'Nutrición',
        'Nutrición Clínica',
        'Obstetricia',
        'Obstetricia Rural',
        'Odontología',
        'Odontologia Rural',
        'Oftalmología',
        'Oncología',
        'Otorrinolaringología',
        'Parasitología',
        'Patología Clínica',
        'Pediatría',
        'Proctología',
        'Psicología Clínica',
        'Psicorehabilitador',
        'Psiquiatría',
        'Psiquiatría Infantil y del Adolescente',
        'Reumatología',
        'Salud Pública',
        'Subespecialidad',
        'Terapia Neural',
        'Ultrasonido',
        'Urología',
        'Enfermería',
        'Auxiliar de Enfermería',
        'Enfermería Rural',
        'Medicina Rural',
        'Medicina General',
        'Vigilancia de la Salud',
        'Estimulación Temprana'
      ];

      // Obtener los roles del usuario
      const userRoles = await user.getRoles();
      const isDoctor = userRoles.some(role => role.nombre === 'doctor');

      // Preparar datos para actualizar
      const updateData = {
        username,
        tipo_identificacion,
        email
      };

      // Validar y actualizar especialidad si el usuario es doctor
      if (isDoctor) {
        if (especialidad === undefined) {
          return res.status(400).json({
            success: false,
            message: 'La especialidad es requerida para usuarios con rol de doctor'
          });
        }
        if (especialidad !== null && !especialidadesValidas.includes(especialidad)) {
          return res.status(400).json({
            success: false,
            message: 'Especialidad no válida'
          });
        }
        updateData.especialidad = especialidad ? especialidad.trim() : null;
      } else {
        updateData.especialidad = null;
      }

      // Solo incluir identificación si no es 'no_identificado'
      if (tipo_identificacion !== 'no_identificado') {
        if (!identificacion) {
          return res.status(400).json({
            success: false,
            message: 'El número de identificación es requerido para el tipo de identificación seleccionado'
          });
        }

        // Limpiar y validar la identificación
        const cleanedIdentificacion = identificacion.toString().trim();
        
        if (tipo_identificacion === 'cedula') {
          if (!/^[0-9]{10}$/.test(cleanedIdentificacion)) {
            return res.status(400).json({
              success: false,
              message: 'La cédula debe tener exactamente 10 dígitos numéricos, sin espacios ni caracteres especiales'
            });
          }
        }
        
        updateData.identificacion = cleanedIdentificacion;
      }

      // Actualizar usuario
      await user.update(updateData);

      // Obtener el usuario actualizado con sus roles
      const updatedUser = await db.User.findByPk(id, {
        attributes: ['id', 'username', 'email', 'tipo_identificacion', 'identificacion'],
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }]
      });

      // Formatear la respuesta para incluir roles como array de strings
      const userResponse = updatedUser.get({ plain: true });
      userResponse.roles = userResponse.roles.map(role => role.nombre);

      return res.status(200).json({
        success: true,
        message: 'Información del usuario actualizada correctamente',
        user: userResponse
      });

    } catch (error) {
      console.error('Error al actualizar información del usuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al actualizar información del usuario',
        error: error.message
      });
    }
  }
  ,

  getDoctoresByEspecialidad: async (req, res) => {
    try {
      console.log('Buscando doctores para especialidad:', req.query.especialidad);
      const { especialidad } = req.query;
      const whereClause = { 
        active: true
      };

      // Construir la consulta base
      const queryOptions = {
        attributes: ['id', 'username', 'especialidad', 'active'],
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }],
        where: whereClause,
        order: [
          ['username', 'ASC']
        ]
      };

      // Si se especifica especialidad, ajustar la consulta
      if (especialidad) {
        if (especialidad === 'Odontología') {
          // Para odontología, buscar usuarios con rol de dentista
          queryOptions.include[0].where = { nombre: 'dentista' };
        } else {
          // Para otras especialidades, buscar doctores con la especialidad específica
          queryOptions.include[0].where = { nombre: 'doctor' };
          whereClause.especialidad = especialidad;
        }
      }

      console.log('Query options:', JSON.stringify(queryOptions, null, 2));
      const doctors = await db.User.findAll(queryOptions);
      console.log('Doctores encontrados:', doctors.length);

      // Transformar los datos para incluir roles como array de strings
      const transformedDoctors = doctors.map(doctor => {
        const plainDoctor = doctor.get({ plain: true });
        return {
          ...plainDoctor,
          roles: plainDoctor.roles.map(r => r.nombre)
        };
      });

      console.log('Doctores transformados:', JSON.stringify(transformedDoctors, null, 2));
      
      res.json({
        success: true,
        data: transformedDoctors
      });
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener doctores',
        error: error.message
      });
    }
  },

  getEspecialidades: async (req, res) => {
    try {
      console.log('Iniciando obtención de especialidades...');
      // Primero, obtener los usuarios activos con sus roles y especialidades
      const usuarios = await db.User.findAll({
        attributes: ['especialidad'],
        include: [{
          model: db.Role,
          as: 'roles',
          where: { nombre: { [db.Sequelize.Op.in]: ['doctor', 'dentista'] } },
          through: { attributes: [] }
        }],
        where: {
          active: true
        }
      });

      // Crear un conjunto de especialidades
      const especialidadesSet = new Set();

      // Procesar cada usuario
      usuarios.forEach(usuario => {
        const roles = usuario.roles.map(r => r.nombre);
        
        if (roles.includes('dentista')) {
          // Si es dentista, agregar Odontología
          especialidadesSet.add('Odontología');
        } else if (roles.includes('doctor') && usuario.especialidad) {
          // Si es doctor y tiene especialidad, agregarla
          especialidadesSet.add(usuario.especialidad);
        }
      });

      // Convertir el conjunto a array y ordenar
      const listaEspecialidades = Array.from(especialidadesSet).sort();
      
      console.log('Usuarios encontrados:', usuarios.length);
      console.log('Especialidades encontradas:', listaEspecialidades);

      res.json({
        success: true,
        data: listaEspecialidades
      });
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener especialidades',
        error: error.message
      });
    }
  }
};

module.exports = userController;