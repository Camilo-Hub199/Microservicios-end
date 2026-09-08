const CustomerService = require('../services/customer-service');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {

    const service = new CustomerService();

    app.post('/customer/signup', async (req, res, next) => {
        try {
            const { email, password, phone } = req.body;
            const { data } = await service.SignUp({ email, password, phone });
            return res.json(data);
        } catch (err) {
            next(err)
        }
    });

    app.post('/customer/login', async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { data } = await service.SignIn({ email, password });
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.post('/customer/address', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { street, postalCode, city, country } = req.body;
            const { data } = await service.AddNewAddress(_id, { street, postalCode, city, country })
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.delete('/customer/address/:addressId', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { addressId } = req.params;
            const { data } = await service.RemoveAddress(_id, addressId);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/customer/profile', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetProfile({ _id });
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/customer/shoping-details', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetShopingDetails(_id);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    })

    app.get('/customer/wishlist', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetWishList(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.put('/customer/wishlist', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.AddToWishlist(_id, req.body);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.delete('/customer/wishlist/:productId', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { productId } = req.params;
            const { data } = await service.RemoveFromWishlist(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.put('/customer/cart', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { qty, ...product } = req.body;
            const { data } = await service.AddToCart(_id, product, qty || 1);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.delete('/customer/cart/:productId', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { productId } = req.params;
            const { data } = await service.RemoveFromCart(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });
}
