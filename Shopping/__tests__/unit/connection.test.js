jest.mock('mongoose');

const mongoose = require('mongoose');
const databaseConnection = require('../../src/database/connection');

describe('Database Connection (Shopping)', () => {

    test('debe conectar a la base de datos y loguear éxito', async () => {

        mongoose.connect.mockResolvedValue();

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await databaseConnection();

        expect(mongoose.connect).toHaveBeenCalled();

        expect(console.log).toHaveBeenCalledWith('Database connected');

        consoleSpy.mockRestore();
    });

    test('debe lanzar el error cuando la conexión falla', async () => {

        mongoose.connect.mockRejectedValue(new Error('fallo de conexión'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(databaseConnection()).rejects.toThrow('fallo de conexión');

        expect(console.error).toHaveBeenCalledWith('Database connection error', expect.any(Error));

        consoleSpy.mockRestore();
    });

});