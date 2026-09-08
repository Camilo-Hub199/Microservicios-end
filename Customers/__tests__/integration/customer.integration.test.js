process.env.APP_SECRET = 'test-secret';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

describe('Customers API — integración (API + servicio + repositorio + MongoDB)', () => {
    let app;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        process.env.DB_URL = mongoServer.getUri();

        const expressApp = require('../../src/express-app');

        await mongoose.connect(mongoServer.getUri());
        app = express();
        await expressApp(app);
    });

    beforeEach(async () => {
        const { CustomerModel, AddressModel } = require('../../src/database/models');
        await CustomerModel.deleteMany({});
        await AddressModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    const signupPayload = () => ({
        email: 'juan@gmail.com',
        password: 'password123',
        phone: '3001234567'
    });

    describe('POST /customer/signup', () => {

        it('crea un cliente en la BD y devuelve id y token', async () => {
            const res = await request(app)
                .post('/customer/signup')
                .send(signupPayload());

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('token');
            expect(res.body.token.split('.')).toHaveLength(3);

            const { CustomerModel } = require('../../src/database/models');
            const customer = await CustomerModel.findById(res.body.id);

            expect(customer.email).toBe('juan@gmail.com');
            expect(customer.password).not.toBe('password123');
            expect(customer.salt).toBeTruthy();
        });

        it('rechaza un email ya registrado con 400', async () => {
            await request(app)
                .post('/customer/signup')
                .send(signupPayload());

            const res = await request(app)
                .post('/customer/signup')
                .send(signupPayload());

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email already registered');
        });
    });

    describe('POST /customer/login', () => {

        it('inicia sesión con credenciales válidas', async () => {
            const { body: signup } = await request(app)
                .post('/customer/signup')
                .send(signupPayload());

            const res = await request(app)
                .post('/customer/login')
                .send({ email: 'juan@gmail.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(signup.id);
            expect(res.body.token).toBeTruthy();
        });

        it('rechaza una contraseña incorrecta con 400', async () => {
            await request(app)
                .post('/customer/signup')
                .send(signupPayload());

            const res = await request(app)
                .post('/customer/login')
                .send({ email: 'juan@gmail.com', password: 'incorrecta' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('rechaza un email inexistente con 400', async () => {
            const res = await request(app)
                .post('/customer/login')
                .send({ email: 'nadie@gmail.com', password: 'password123' });

            expect(res.status).toBe(400);
        });
    });

    describe('Rutas protegidas con token JWT', () => {

        let token;

        beforeEach(async () => {
            const { body } = await request(app)
                .post('/customer/signup')
                .send(signupPayload());
            token = body.token;
        });

        it('GET /customer/profile exige autenticación (401 sin token)', async () => {
            const res = await request(app).get('/customer/profile');

            expect(res.status).toBe(401);
        });

        it('GET /customer/profile exige autenticación (401 token inválido)', async () => {
            const res = await request(app)
                .get('/customer/profile')
                .set('Authorization', 'Bearer token-invalido');

            expect(res.status).toBe(401);
        });

        it('GET /customer/profile con token devuelve el perfil sin datos sensibles', async () => {
            const res = await request(app)
                .get('/customer/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('juan@gmail.com');
            expect(res.body.phone).toBe('3001234567');
            expect(res.body._id).toBeTruthy();
            expect(res.body.password).toBeUndefined();
            expect(res.body.salt).toBeUndefined();
            expect(res.body.__v).toBeUndefined();
        });

        it('POST /customer/address agrega una dirección y el perfil la refleja', async () => {
            const addRes = await request(app)
                .post('/customer/address')
                .set('Authorization', `Bearer ${token}`)
                .send({ street: 'Calle 1', postalCode: '111', city: 'Bogotá', country: 'CO' });

            expect(addRes.status).toBe(200);
            expect(addRes.body._id).toBeTruthy();
            expect(addRes.body.street).toBe('Calle 1');

            const profileRes = await request(app)
                .get('/customer/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(profileRes.status).toBe(200);
            expect(profileRes.body.address).toHaveLength(1);
            expect(profileRes.body.address[0].city).toBe('Bogotá');
        });

        it('DELETE /customer/address/:addressId elimina la dirección', async () => {
            const { body: address } = await request(app)
                .post('/customer/address')
                .set('Authorization', `Bearer ${token}`)
                .send({ street: 'Calle 2', postalCode: '222', city: 'Medellín', country: 'CO' });

            const res = await request(app)
                .delete(`/customer/address/${address._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(0);

            const profileRes = await request(app)
                .get('/customer/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(profileRes.body.address).toHaveLength(0);
        });

        it('PUT /customer/cart agrega, actualiza y elimina ítems', async () => {
            const add = await request(app)
                .put('/customer/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({ _id: 'prod-1', name: 'Auto X', price: 100, qty: 2 });

            expect(add.status).toBe(200);
            expect(add.body).toHaveLength(1);
            expect(add.body[0].product.name).toBe('Auto X');
            expect(add.body[0].unit).toBe(2);

            const update = await request(app)
                .put('/customer/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({ _id: 'prod-1', name: 'Auto X', price: 100, qty: 5 });

            expect(update.status).toBe(200);
            expect(update.body).toHaveLength(1);
            expect(update.body[0].unit).toBe(5);

            const remove = await request(app)
                .delete('/customer/cart/prod-1')
                .set('Authorization', `Bearer ${token}`);

            expect(remove.status).toBe(200);
            expect(remove.body).toHaveLength(0);
        });

        it('PUT/GET/DELETE de wishlist funcionan contra la BD', async () => {
            const add = await request(app)
                .put('/customer/wishlist')
                .set('Authorization', `Bearer ${token}`)
                .send({ _id: 'prod-2', name: 'Auto Y', price: 150 });

            expect(add.status).toBe(200);
            expect(add.body).toHaveLength(1);

            const list = await request(app)
                .get('/customer/wishlist')
                .set('Authorization', `Bearer ${token}`);

            expect(list.status).toBe(200);
            expect(list.body).toHaveLength(1);
            expect(list.body[0]._id).toBe('prod-2');

            const remove = await request(app)
                .delete('/customer/wishlist/prod-2')
                .set('Authorization', `Bearer ${token}`);

            expect(remove.status).toBe(200);
            expect(remove.body).toHaveLength(0);

            const after = await request(app)
                .get('/customer/wishlist')
                .set('Authorization', `Bearer ${token}`);

            expect(after.body).toHaveLength(0);
        });

        it('GET /customer/shoping-details devuelve cart, wishlist y orders', async () => {
            await request(app)
                .put('/customer/cart')
                .set('Authorization', `Bearer ${token}`)
                .send({ _id: 'prod-1', name: 'Auto X', price: 100, qty: 1 });

            const res = await request(app)
                .get('/customer/shoping-details')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.cart).toHaveLength(1);
            expect(res.body.wishlist).toHaveLength(0);
            expect(res.body.orders).toHaveLength(0);
        });
    });
});