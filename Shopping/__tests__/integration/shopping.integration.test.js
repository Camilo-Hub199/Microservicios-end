const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

describe('Shopping API — integración (API + servicio + repositorio + MongoDB)', () => {
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
        const { OrderModel } = require('../../src/database/models');
        await OrderModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('Health', () => {

        it('GET /shopping indica el servicio activo', async () => {
            const res = await request(app).get('/shopping');

            expect(res.status).toBe(200);
            expect(res.body.service).toBe('Shopping Service');
            expect(res.body.status).toBe('running');
        });

        it('GET /shopping/health indica OK', async () => {
            const res = await request(app).get('/shopping/health');

            expect(res.status).toBe(200);
            expect(res.body.service).toBe('shopping');
            expect(res.body.status).toBe('OK');
        });
    });

    describe('POST /shopping/order', () => {

        it('crea una orden persistida con monto calculado', async () => {
            const res = await request(app)
                .post('/shopping/order')
                .send({
                    customerId: 'cust-123',
                    txnId: 'txn-abc',
                    items: [
                        { product: { _id: 'p1', name: 'Auto', price: 100 }, unit: 2 },
                        { product: { _id: 'p2', name: 'SUV', price: 50 }, unit: 3 }
                    ]
                });

            expect(res.status).toBe(201);

            const order = res.body.data;
            expect(order.orderId).toBeTruthy();
            expect(order.customerId).toBe('cust-123');
            expect(order.txnId).toBe('txn-abc');
            expect(order.status).toBe('received');
            expect(order.amount).toBe(350);
            expect(order.items).toHaveLength(2);

            const { OrderModel } = require('../../src/database/models');
            const stored = await OrderModel.findOne({ orderId: order.orderId });

            expect(stored).not.toBeNull();
            expect(stored.customerId).toBe('cust-123');
            expect(stored.amount).toBe(350);
        });

        it('crea orden sin txnId ni items usando defaults', async () => {
            const res = await request(app)
                .post('/shopping/order')
                .send({ customerId: 'cust-456' });

            expect(res.status).toBe(201);
            expect(res.body.data.txnId).toBeNull();
            expect(res.body.data.items).toEqual([]);
            expect(res.body.data.amount).toBe(0);
        });

        it('rechaza la orden si falta customerId con 400', async () => {
            const res = await request(app)
                .post('/shopping/order')
                .send({ txnId: 'txn-xyz', items: [] });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('customerId es requerido');
        });
    });

    describe('GET /shopping/orders/:customerId', () => {

        it('devuelve todas las órdenes creadas para el cliente', async () => {
            await request(app)
                .post('/shopping/order')
                .send({
                    customerId: 'cust-123',
                    txnId: 'txn-1',
                    items: [{ product: { _id: 'p1', price: 100 }, unit: 1 }]
                });

            await request(app)
                .post('/shopping/order')
                .send({
                    customerId: 'cust-123',
                    txnId: 'txn-2',
                    items: [{ product: { _id: 'p2', price: 200 }, unit: 1 }]
                });

            const res = await request(app).get('/shopping/orders/cust-123');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);

            const amounts = res.body.data.map((o) => o.amount);
            expect(amounts).toEqual(expect.arrayContaining([100, 200]));
        });

        it('devuelve lista vacía si el cliente no tiene órdenes', async () => {
            const res = await request(app).get('/shopping/orders/nadie');

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });
    });
});