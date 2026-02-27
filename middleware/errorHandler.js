const { ValidationError } = require('sequelize');

function errorHandler(err, req, res, next) {
    console.error('Error completo:', err);

    if (err instanceof ValidationError) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: err.errors.map(e => ({
                message: e.message,
                field: e.path
            }))
        });
    }

    // Para errores de base de datos
    if (err.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
            message: 'Error de base de datos',
            error: err.original ? err.original.message : err.message
        });
    }

    // Error por defecto
    res.status(500).json({
        message: 'Error interno del servidor',
        error: err.message
    });
}

module.exports = errorHandler;
