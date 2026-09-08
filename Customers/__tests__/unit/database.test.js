const database = require('../../src/database');

describe('Database index (Customers)', () => {

    test('debe exponer la conexión a la base de datos', () => {

        expect(typeof database.databaseConnection).toBe('function');
    });

    test('debe exponer el repositorio de clientes', () => {

        expect(typeof database.CustomerRepository).toBe('function');
    });

});