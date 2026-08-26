const ProductsService = require('../services/products-service');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {

    const service = new ProductsService();

    app.get('/', async (req, res, next) => {
        try {
            const { data } = await service.GetProducts();
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/:id', async (req, res, next) => {
        try {
            const { data } = await service.GetProductById(req.params.id);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });
};
