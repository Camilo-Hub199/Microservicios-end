process.env.APP_SECRET = 'test-secret';

jest.mock('../../src/services/customer-service', () =>
    jest.fn().mockImplementation(() => ({
        SignUp: jest.fn(),
        SignIn: jest.fn(),
        AddNewAddress: jest.fn(),
        GetProfile: jest.fn(),
        GetShopingDetails: jest.fn(),
        GetWishList: jest.fn()
    }))
);

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const expressApp = require('../../src/express-app');
const CustomerService = require('../../src/services/customer-service');

describe('Customers API', () => {

    let app;
    let token;
    let serviceInstance;
    let logSpy;
    let errorSpy;

    beforeEach(async () => {
        jest.clearAllMocks();

        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        token = jwt.sign({ _id: 'cust-1' }, process.env.APP_SECRET);

        app = express();
        await expressApp(app);

        serviceInstance = CustomerService.mock.results[0].value;
    });

    afterEach(() => {
        logSpy.mockRestore();
        errorSpy.mockRestore();
    });

    test('POST /customer/signup debe crear un cliente', async () => {

        serviceInstance.SignUp.mockResolvedValue({
            data: { id: 'cust-1', token }
        });

        const res = await request(app)
            .post('/customer/signup')
            .send({ email: 'juan@gmail.com', password: 'password123', phone: '3001234567' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 'cust-1', token });
        expect(serviceInstance.SignUp).toHaveBeenCalledWith({
            email: 'juan@gmail.com',
            password: 'password123',
            phone: '3001234567'
        });
    });

    test('POST /customer/login debe iniciar sesión', async () => {

        serviceInstance.SignIn.mockResolvedValue({
            data: { id: 'cust-1', token }
        });

        const res = await request(app)
            .post('/customer/login')
            .send({ email: 'juan@gmail.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe('cust-1');
        expect(res.body.token).toBe(token);
        expect(serviceInstance.SignIn).toHaveBeenCalledWith({
            email: 'juan@gmail.com',
            password: 'password123'
        });
    });

    test('POST /customer/address debe exigir autenticación', async () => {

        const res = await request(app)
            .post('/customer/address')
            .send({ street: 'Calle 1' });

        expect(res.status).toBe(401);
        expect(serviceInstance.AddNewAddress).not.toHaveBeenCalled();
    });

    test('POST /customer/address debe agregar una dirección autenticado', async () => {

        serviceInstance.AddNewAddress.mockResolvedValue({
            data: { _id: 'addr-1', street: 'Calle 1' }
        });

        const res = await request(app)
            .post('/customer/address')
            .set('Authorization', `Bearer ${token}`)
            .send({ street: 'Calle 1', postalCode: '111', city: 'Bogotá', country: 'CO' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ _id: 'addr-1', street: 'Calle 1' });
        expect(serviceInstance.AddNewAddress).toHaveBeenCalledWith('cust-1', {
            street: 'Calle 1',
            postalCode: '111',
            city: 'Bogotá',
            country: 'CO'
        });
    });

    test('GET /customer/profile debe exigir autenticación', async () => {

        const res = await request(app).get('/customer/profile');

        expect(res.status).toBe(401);
        expect(serviceInstance.GetProfile).not.toHaveBeenCalled();
    });

    test('GET /customer/profile debe devolver el perfil autenticado', async () => {

        serviceInstance.GetProfile.mockResolvedValue({
            data: { _id: 'cust-1', email: 'juan@gmail.com' }
        });

        const res = await request(app)
            .get('/customer/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ _id: 'cust-1', email: 'juan@gmail.com' });
        expect(serviceInstance.GetProfile).toHaveBeenCalledWith({ _id: 'cust-1' });
    });

    test('GET /customer/shoping-details debe devolver los detalles de compra', async () => {

        serviceInstance.GetShopingDetails.mockResolvedValue({
            data: { cart: [], wishlist: [], orders: [] }
        });

        const res = await request(app)
            .get('/customer/shoping-details')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ cart: [], wishlist: [], orders: [] });
        expect(serviceInstance.GetShopingDetails).toHaveBeenCalledWith('cust-1');
    });

    test('GET /customer/wishlist debe devolver la wishlist', async () => {

        serviceInstance.GetWishList.mockResolvedValue({
            data: [{ _id: 'p-1' }]
        });

        const res = await request(app)
            .get('/customer/wishlist')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ _id: 'p-1' }]);
        expect(serviceInstance.GetWishList).toHaveBeenCalledWith('cust-1');
    });

    test('debe propagar los errores al handler central', async () => {

        serviceInstance.SignUp.mockRejectedValue(new Error('fallo interno'));

        const res = await request(app)
            .post('/customer/signup')
            .send({ email: 'a@gmail.com', password: '123456' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('fallo interno');
    });

});