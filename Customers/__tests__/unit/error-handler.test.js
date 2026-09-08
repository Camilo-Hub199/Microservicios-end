const errorHandler = require('../../src/utils/error-handler');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../../src/utils/app-errors');

describe('Error Handler (Customers)', () => {

    test('debe responder el statusCode y mensaje de un APIError', () => {

        const error = new BadRequestError('Datos inválidos');

        const req = {
            method: 'GET',
            originalUrl: '/customer'
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Datos inválidos'
        });

        consoleSpy.mockRestore();
    });

    test('debe responder 401 para un UnauthorizedError', () => {

        const error = new UnauthorizedError('Invalid or expired token');

        const req = {
            method: 'GET',
            originalUrl: '/customer'
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid or expired token'
        });

        consoleSpy.mockRestore();
    });

    test('debe responder 404 para un NotFoundError', () => {

        const error = new NotFoundError('Cliente no encontrado');

        const req = {
            method: 'GET',
            originalUrl: '/customer/profile'
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Cliente no encontrado'
        });

        consoleSpy.mockRestore();
    });

    test('debe responder 500 con el mensaje del error desconocido', () => {

        const error = new Error('Error interno');

        const req = {
            method: 'GET',
            originalUrl: '/customer'
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Error interno'
        });

        expect(console.error).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

});