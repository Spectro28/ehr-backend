'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla de Diagnósticos Dentales
    await queryInterface.createTable('Diagnosticos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Campos para compatibilidad con el sistema existente
      evolucionid: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cieid: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de Procedimientos Dentales
    await queryInterface.createTable('Procedimientos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla principal de Odontogramas
    await queryInterface.createTable('Odontogramas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      evolucionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Evoluciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      dentistaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de Piezas Dentales del Odontograma
    await queryInterface.createTable('PiezasOdontograma', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      odontogramaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Odontogramas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      numeroPieza: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cara: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      diagnosticoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Diagnosticos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      procedimientoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Procedimientos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      recesion: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      movilidad: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      estado: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      hallazgos: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      tratamientos: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de Índices Odontológicos
    await queryInterface.createTable('IndicesOdontograma', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      odontogramaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Odontogramas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      valor: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      detalles: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices para mejorar el rendimiento
    await queryInterface.addIndex('PiezasOdontograma', ['odontogramaId']);
    await queryInterface.addIndex('PiezasOdontograma', ['diagnosticoId']);
    await queryInterface.addIndex('PiezasOdontograma', ['procedimientoId']);
    await queryInterface.addIndex('IndicesOdontograma', ['odontogramaId']);
    await queryInterface.addIndex('Odontogramas', ['pacienteId']);
    await queryInterface.addIndex('Odontogramas', ['dentistaId']);

    // Crear índices únicos
    await queryInterface.addIndex('PiezasOdontograma', {
      fields: ['odontogramaId', 'numeroPieza', 'cara'],
      unique: true,
      name: 'pieza_odontograma_unique'
    });

    await queryInterface.addIndex('IndicesOdontograma', {
      fields: ['odontogramaId', 'tipo'],
      unique: true,
      name: 'indice_odontograma_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices primero
    await queryInterface.removeIndex('PiezasOdontograma', 'pieza_odontograma_unique');
    await queryInterface.removeIndex('IndicesOdontograma', 'indice_odontograma_unique');
    await queryInterface.removeIndex('PiezasOdontograma', ['odontogramaId']);
    await queryInterface.removeIndex('PiezasOdontograma', ['diagnosticoId']);
    await queryInterface.removeIndex('PiezasOdontograma', ['procedimientoId']);
    await queryInterface.removeIndex('IndicesOdontograma', ['odontogramaId']);
    await queryInterface.removeIndex('Odontogramas', ['pacienteId']);
    await queryInterface.removeIndex('Odontogramas', ['dentistaId']);

    // Eliminar tablas en orden inverso
    await queryInterface.dropTable('IndicesOdontograma');
    await queryInterface.dropTable('PiezasOdontograma');
    await queryInterface.dropTable('Odontogramas');
    await queryInterface.dropTable('Procedimientos');
    await queryInterface.dropTable('Diagnosticos');
  }
};
