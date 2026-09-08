process.env.APP_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');

const {
    GenerateSalt,
    GeneratePassword,
    ValidatePassword,
    GenerateSignature,
    FormateData
} = require('../../src/utils');

describe('Utils Shopping', () => {

    test('GenerateSalt debe generar un salt válido', async () => {

        const salt = await GenerateSalt();

        expect(salt).toBeDefined();
        expect(typeof salt).toBe('string');
        expect(salt.length).toBeGreaterThan(0);
    });

    test('GeneratePassword debe generar el hash de la contraseña', async () => {

        const salt = await GenerateSalt();

        const hash = await GeneratePassword('password123', salt);

        expect(hash).toBeDefined();
        expect(hash).not.toBe('password123');
    });

    test('ValidatePassword debe validar la contraseña correcta', async () => {

        const salt = await GenerateSalt();

        const hash = await GeneratePassword('password123', salt);

        const isValid = await ValidatePassword('password123', hash, salt);

        expect(isValid).toBe(true);
    });

    test('ValidatePassword debe rechazar una contraseña incorrecta', async () => {

        const salt = await GenerateSalt();

        const hash = await GeneratePassword('password123', salt);

        const isValid = await ValidatePassword('incorrecta', hash, salt);

        expect(isValid).toBe(false);
    });

    test('GenerateSignature debe generar un JWT verificable', async () => {

        const payload = {
            id: '123',
            email: 'juan@gmail.com'
        };

        const token = await GenerateSignature(payload);

        expect(token).toBeDefined();

        const decoded = jwt.verify(token, process.env.APP_SECRET);

        expect(decoded.id).toBe('123');
        expect(decoded.email).toBe('juan@gmail.com');
    });

    test('FormateData debe envolver la data dentro de un objeto', () => {

        const result = FormateData({ a: 1 });

        expect(result).toEqual({ data: { a: 1 } });
    });

});