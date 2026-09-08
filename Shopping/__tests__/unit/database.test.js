const database = require('../../src/database');

describe('Database index (Shopping)', () => {

    test('debe exponer la conexión a la base de datos', () => {

        expect(typeof database.databaseConnection).toBe('function');
    });

    test('debe exponer el repositorio de shopping', () => {

        expect(typeof database.ShoppingRepository).toBe('function');
    });

});