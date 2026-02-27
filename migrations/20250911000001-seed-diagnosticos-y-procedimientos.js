'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar diagnósticos dentales de ejemplo
    await queryInterface.bulkInsert('Diagnosticos', [
      {
        nombre: 'Caries',
        codigo: 'CAR',
        descripcion: 'Lesión en el diente causada por bacterias',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Fractura',
        codigo: 'FRA',
        descripcion: 'Ruptura o quiebre del diente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Ausente',
        codigo: 'AUS',
        descripcion: 'Pieza dental faltante',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Obturación',
        codigo: 'OBT',
        descripcion: 'Restauración dental existente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Sellante',
        codigo: 'SEL',
        descripcion: 'Sellante preventivo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Endodoncia',
        codigo: 'END',
        descripcion: 'Tratamiento de conducto radicular',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Corona',
        codigo: 'COR',
        descripcion: 'Corona dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Implante',
        codigo: 'IMP',
        descripcion: 'Implante dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Prótesis',
        codigo: 'PRO',
        descripcion: 'Prótesis dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Gingivitis',
        codigo: 'GIN',
        descripcion: 'Inflamación de las encías',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insertar procedimientos dentales de ejemplo
    await queryInterface.bulkInsert('Procedimientos', [
      {
        nombre: 'Restauración',
        codigo: 'RES',
        descripcion: 'Restauración de pieza dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Extracción',
        codigo: 'EXT',
        descripcion: 'Extracción de pieza dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Endodoncia',
        codigo: 'END',
        descripcion: 'Tratamiento de conducto',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Corona',
        codigo: 'COR',
        descripcion: 'Colocación de corona dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Limpieza',
        codigo: 'LIM',
        descripcion: 'Profilaxis dental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Sellante',
        codigo: 'SEL',
        descripcion: 'Aplicación de sellante',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Implante',
        codigo: 'IMP',
        descripcion: 'Colocación de implante',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Prótesis',
        codigo: 'PRO',
        descripcion: 'Colocación de prótesis',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Brackets',
        codigo: 'BRA',
        descripcion: 'Ortodoncia con brackets',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Blanqueamiento',
        codigo: 'BLA',
        descripcion: 'Blanqueamiento dental',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar los datos insertados
    await queryInterface.bulkDelete('Procedimientos', null, {});
    await queryInterface.bulkDelete('Diagnosticos', null, {});
  }
};
