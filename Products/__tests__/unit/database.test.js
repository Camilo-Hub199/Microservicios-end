const database = require('../../src/database');

describe('Database index (Products)', () => {

    test('debe exponer la conexión a la base de datos', () => {

        expect(typeof database.databaseConnection).toBe('function');
    });

    test('debe exponer el repositorio de productos', () => {

        expect(typeof database.ProductRepository).toBe('function');
    });

});