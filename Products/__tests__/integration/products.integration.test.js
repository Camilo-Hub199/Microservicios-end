const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

describe('Products API — integración (API + servicio + repositorio + MongoDB)', () => {
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
        const { ProductModel } = require('../../src/database/models');
        await ProductModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    const { ProductModel } = require('../../src/database/models');

    const seedProducts = () =>
        ProductModel.create([
            { name: 'Sedán GLX', desc: 'Auto 4 puertas', type: 'sedan', price: 15000, banner: 'sedan.jpg' },
            { name: 'SUV Lujo', desc: 'Auto familiar', type: 'suv', price: 25000, banner: 'suv.jpg' },
            { name: 'Deportivo GT', desc: 'Coupé deportivo', type: 'deportivo', price: 40000, banner: 'gt.jpg' }
        ]);

    describe('GET /', () => {

        it('devuelve los productos sembrados y sus categorías únicas', async () => {
            await seedProducts();

            const res = await request(app).get('/');

            expect(res.status).toBe(200);
            expect(res.body.products).toHaveLength(3);

            const names = res.body.products.map((p) => p.name);
            expect(names).toEqual(expect.arrayContaining(['Sedán GLX', 'SUV Lujo', 'Deportivo GT']));

            expect(res.body.products[0]).toHaveProperty('_id');
            expect(res.body.products[0]).toHaveProperty('price');
            expect(res.body.products[0].available).toBe(true);

            expect([...res.body.categories].sort()).toEqual(['deportivo', 'sedan', 'suv']);
        });

        it('devuelve listado y categorías vacíos cuando la BD no tiene productos', async () => {
            const res = await request(app).get('/');

            expect(res.status).toBe(200);
            expect(res.body.products).toEqual([]);
            expect(res.body.categories).toEqual([]);
        });
    });

    describe('GET /:id', () => {

        it('devuelve el producto persistido en la BD por su id', async () => {
            const [product] = await seedProducts();

            const res = await request(app).get(`/${product._id}`);

            expect(res.status).toBe(200);
            expect(res.body._id).toBe(product._id.toString());
            expect(res.body.name).toBe('Sedán GLX');
            expect(res.body.type).toBe('sedan');
            expect(res.body.price).toBe(15000);
        });

        it('devuelve 404 cuando el id no existe', async () => {
            const id = new mongoose.Types.ObjectId();

            const res = await request(app).get(`/${id}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Product not found');
        });
    });
});