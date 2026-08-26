const ShoppingService = require('../services/shopping-service');

const shoppingService = new ShoppingService();

module.exports = (app) => {

    // ==========================================
    // HEALTH
    // ==========================================

    app.get('/shopping', (req, res) => {
        res.json({
            service: 'Shopping Service',
            status: 'running',
            message: 'Shopping microservice funcionando correctamente'
        });
    });

    app.get('/shopping/health', (req, res) => {
        res.json({
            service: 'shopping',
            status: 'OK'
        });
    });


    // ==========================================
    // CREAR ORDEN
    // ==========================================

    app.post('/shopping/order', async (req, res, next) => {

        try {

            const {
                customerId,
                txnId,
                items
            } = req.body;

            if (!customerId) {
                return res.status(400).json({
                    message: 'customerId es requerido'
                });
            }

            const result = await shoppingService.PlaceOrder(
                customerId,
                txnId,
                items || []
            );

            return res.status(201).json(result);

        } catch (err) {

            next(err);

        }

    });


    // ==========================================
    // CONSULTAR ÓRDENES DE UN CLIENTE
    // ==========================================

    app.get('/shopping/orders/:customerId', async (req, res, next) => {

        try {

            const { customerId } = req.params;

            const result = await shoppingService.GetOrders(
                customerId
            );

            return res.status(200).json(result);

        } catch (err) {

            next(err);

        }

    });

};

