const {
    APIError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    STATUS_CODES
} = require('../../src/utils/app-errors');

describe('App Errors (Customers)', () => {

    test('APIError debe crear un error con statusCode y descripción por defecto', () => {

        const error = new APIError('APIError');

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('APIError');
        expect(error.statusCode).toBe(STATUS_CODES.INTERNAL_ERROR);
        expect(error.message).toBe('Internal server error');
    });

    test('APIError debe permitir un statusCode y descripción personalizados', () => {

        const error = new APIError('CustomError', 404, 'No encontrado');

        expect(error.name).toBe('CustomError');
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('No encontrado');
    });

    test('BadRequestError debe usar el status 400', () => {

        const error = new BadRequestError('Datos inválidos');

        expect(error).toBeInstanceOf(APIError);
        expect(error.name).toBe('BadRequestError');
        expect(error.statusCode).toBe(STATUS_CODES.BAD_REQUEST);
        expect(error.message).toBe('Datos inválidos');
    });

    test('NotFoundError debe usar el status 404', () => {

        const error = new NotFoundError('No encontrado');

        expect(error).toBeInstanceOf(APIError);
        expect(error.name).toBe('NotFoundError');
        expect(error.statusCode).toBe(STATUS_CODES.NOT_FOUND);
        expect(error.message).toBe('No encontrado');
    });

    test('UnauthorizedError debe usar el status 401', () => {

        const error = new UnauthorizedError('No autorizado');

        expect(error).toBeInstanceOf(APIError);
        expect(error.name).toBe('UnauthorizedError');
        expect(error.statusCode).toBe(STATUS_CODES.UNAUTHORIZED);
        expect(error.message).toBe('No autorizado');
    });

    test('STATUS_CODES debe exponer los códigos esperados', () => {

        expect(STATUS_CODES).toEqual({
            OK: 200,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            NOT_FOUND: 404,
            INTERNAL_ERROR: 500
        });
    });

});