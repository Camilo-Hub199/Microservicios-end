const { APIError, STATUS_CODES } = require('./app-errors');

module.exports = (err, req, res, next) => {

    console.error('\n========== ERROR ==========');
    console.error('METHOD:', req.method);
    console.error('URL:', req.originalUrl);
    console.error('ERROR:', err);
    console.error('MESSAGE:', err.message);
    console.error('STACK:', err.stack);
    console.error('===========================\n');

    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    return res.status(STATUS_CODES.INTERNAL_ERROR).json({
        message: err.message || 'Internal server error'
    });
};
