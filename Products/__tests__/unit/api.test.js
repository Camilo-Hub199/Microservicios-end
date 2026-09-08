jest.mock('../../src/services/products-service', () =>
    jest.fn().mockImplementation(() => ({
        GetProducts: jest.fn(),
        GetProductById: jest.fn()
    }))
);

const request = require('supertest');
const express = require('express');

const expressApp = require('../../src/express-app');
const ProductsService = require('../../src/services/products-service');

describe('Products API', () => {

    let app;
    let serviceInstance;

    beforeEach(async () => {
        jest.clearAllMocks();

        app = express();
        await expressApp(app);

        serviceInstance = ProductsService.mock.results[0].value;
    });

    test('GET / debe devolver todos los productos', async () => {

        const products = [
            { _id: 'p-1', name: 'Pizza', type: 'Comida' },
            { _id: 'p-2', name: 'Jugo', type: 'Bebida' }
        ];

        serviceInstance.GetProducts.mockResolvedValue({
            data: { products, categories: ['Comida', 'Bebida'] }
        });

        const res = await request(app).get('/');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ products, categories: ['Comida', 'Bebida'] });
        expect(serviceInstance.GetProducts).toHaveBeenCalled();
    });

    test('GET /:id debe devolver un producto', async () => {

        serviceInstance.GetProductById.mockResolvedValue({
            data: { _id: 'p-1', name: 'Pizza', type: 'Comida' }
        });

        const res = await request(app).get('/p-1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ _id: 'p-1', name: 'Pizza', type: 'Comida' });
        expect(serviceInstance.GetProductById).toHaveBeenCalledWith('p-1');
    });

    test('debe propagar los errores al handler central', async () => {

        serviceInstance.GetProducts.mockRejectedValue(new Error('fallo interno'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).get('/');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');

        consoleSpy.mockRestore();
    });

});