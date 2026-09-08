const http = require('http');
const request = require('supertest');

let customerServer;
let productsServer;
let shoppingServer;

let customerPort;
let productsPort;
let shoppingPort;

let app;

function createTestServer(responseData) {
    return http.createServer((req, res) => {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(responseData));
    });
}

function listen(server) {
    return new Promise((resolve, reject) => {
        server.listen(0, '127.0.0.1', () => {
            resolve(server.address().port);
        });

        server.on('error', reject);
    });
}

function closeServer(server) {
    return new Promise((resolve, reject) => {
        if (!server) {
            resolve();
            return;
        }

        server.close((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

beforeAll(async () => {
    customerServer = createTestServer({
        service: 'customers',
        message: 'Customers Service OK'
    });

    productsServer = createTestServer({
        service: 'products',
        message: 'Products Service OK'
    });

    shoppingServer = createTestServer({
        service: 'shopping',
        message: 'Shopping Service OK'
    });

    customerPort = await listen(customerServer);
    productsPort = await listen(productsServer);
    shoppingPort = await listen(shoppingServer);

    process.env.CUSTOMER_SERVICE_URL =
        `http://127.0.0.1:${customerPort}`;

    process.env.PRODUCTS_SERVICE_URL =
        `http://127.0.0.1:${productsPort}`;

    process.env.SHOPPING_SERVICE_URL =
        `http://127.0.0.1:${shoppingPort}`;

    jest.resetModules();

    app = require('../../index');
});

afterAll(async () => {
    await closeServer(customerServer);
    await closeServer(productsServer);
    await closeServer(shoppingServer);
});

describe('API Gateway - Integration Tests', () => {

    test('GET /health debe responder correctamente', async () => {
        const response = await request(app)
            .get('/health');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: 'API Gateway is running'
        });
    });

    test('una ruta inexistente debe devolver 404', async () => {
        const response = await request(app)
            .get('/ruta-que-no-existe');

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: 'Ruta no encontrada en el API Gateway'
        });
    });

    test('GET /customer debe ser enviado al Customers Service', async () => {
        const response = await request(app)
            .get('/customer');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            service: 'customers',
            message: 'Customers Service OK'
        });
    });

    test('GET /products debe ser enviado al Products Service', async () => {
        const response = await request(app)
            .get('/products');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            service: 'products',
            message: 'Products Service OK'
        });
    });

    test('GET /shopping debe ser enviado al Shopping Service', async () => {
        const response = await request(app)
            .get('/shopping');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            service: 'shopping',
            message: 'Shopping Service OK'
        });
    });

    test('GET /products/123 debe mantener la ruta correctamente', async () => {
        const response = await request(app)
            .get('/products/123');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            service: 'products',
            message: 'Products Service OK'
        });
    });

});
