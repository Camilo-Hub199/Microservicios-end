jest.mock('../../src/services/shopping-service', () =>
    jest.fn().mockImplementation(() => ({
        PlaceOrder: jest.fn(),
        GetOrders: jest.fn()
    }))
);

const request = require('supertest');
const express = require('express');

const expressApp = require('../../src/express-app');
const ShoppingService = require('../../src/services/shopping-service');

const serviceInstance = ShoppingService.mock.results[0].value;

describe('Shopping API', () => {

    let app;

    beforeEach(async () => {
        jest.resetAllMocks();
        app = express();
        await expressApp(app);
    });

    test('GET / debe devolver el estado del servicio', async () => {

        const res = await request(app).get('/');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            service: 'Shopping Service',
            status: 'running'
        });
    });

    test('GET /shopping/health debe devolver OK', async () => {

        const res = await request(app).get('/shopping/health');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
    });

    test('POST /shopping/order debe crear una orden', async () => {

        serviceInstance.PlaceOrder.mockResolvedValue({
            data: { orderId: 'ord-1', customerId: 'cust-1' }
        });

        const res = await request(app)
            .post('/shopping/order')
            .send({ customerId: 'cust-1', txnId: 'txn-1', items: [] });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            data: { orderId: 'ord-1', customerId: 'cust-1' }
        });
        expect(serviceInstance.PlaceOrder).toHaveBeenCalledWith('cust-1', 'txn-1', []);
    });

    test('POST /shopping/order debe devolver 400 sin customerId', async () => {

        const res = await request(app)
            .post('/shopping/order')
            .send({ items: [] });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('customerId es requerido');
        expect(serviceInstance.PlaceOrder).not.toHaveBeenCalled();
    });

    test('GET /shopping/orders/:customerId debe devolver las órdenes', async () => {

        serviceInstance.GetOrders.mockResolvedValue({
            data: [{ orderId: 'ord-1' }, { orderId: 'ord-2' }]
        });

        const res = await request(app).get('/shopping/orders/cust-1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ data: [{ orderId: 'ord-1' }, { orderId: 'ord-2' }] });
        expect(serviceInstance.GetOrders).toHaveBeenCalledWith('cust-1');
    });

    test('debe propagar los errores al handler central', async () => {

        serviceInstance.GetOrders.mockRejectedValue(new Error('fallo interno'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).get('/shopping/orders/cust-1');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');

        consoleSpy.mockRestore();
    });

});