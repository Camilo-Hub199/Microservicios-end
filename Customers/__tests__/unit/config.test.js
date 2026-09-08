describe('Config Customers', () => {

    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    test('debe usar el puerto por defecto cuando no está definido', () => {

        delete process.env.PORT;

        jest.resetModules();

        const config = require('../../src/config');

        expect(config.PORT).toBe(8001);
    });

    test('debe leer PORT, DB_URL y APP_SECRET desde el entorno', () => {

        process.env.PORT = '9101';
        process.env.DB_URL = 'mongodb://test:27017/customers';
        process.env.APP_SECRET = 'mi-secreto';

        jest.resetModules();

        const config = require('../../src/config');

        expect(config.PORT).toBe('9101');
        expect(config.DB_URL).toBe('mongodb://test:27017/customers');
        expect(config.APP_SECRET).toBe('mi-secreto');
    });

    test('debe exponer las claves esperadas', () => {

        const config = require('../../src/config');

        expect(config).toHaveProperty('PORT');
        expect(config).toHaveProperty('DB_URL');
        expect(config).toHaveProperty('APP_SECRET');
    });

});