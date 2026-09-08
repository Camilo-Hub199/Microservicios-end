const { CustomerModel, AddressModel } = require('../models');
const { APIError, BadRequestError } = require('../../utils/app-errors');

class CustomerRepository {

    async CreateCustomer({ email, password, phone, salt }) {
        try {
            console.log('========== CREATE CUSTOMER ==========');
            console.log('Email:', email);
            console.log('Phone:', phone);
            console.log('Salt recibido:', !!salt);
            console.log('Password recibido:', !!password);

            const customer = await CustomerModel.create({
                email,
                password,
                salt,
                phone
            });

            console.log('CUSTOMER CREADO:', customer._id);
            console.log('=====================================');

            return customer;

        } catch (err) {

            console.error('========== ERROR CREATE CUSTOMER ==========');
            console.error('NAME:', err.name);
            console.error('MESSAGE:', err.message);
            console.error('CODE:', err.code);
            console.error('ERROR COMPLETO:', err);
            console.error('STACK ORIGINAL:', err.stack);
            console.error('============================================');

            if (err.code === 11000) {
                throw new BadRequestError('Email already registered');
            }

            throw new APIError(
                'CreateCustomerError',
                500,
                err.message
            );
        }
    }

    async FindCustomer({ email }) {
        return CustomerModel.findOne({ email });
    }

    async AddNewAddress(customerId, { street, postalCode, city, country }) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        const address = await AddressModel.create({
            street,
            postalCode,
            city,
            country
        });

        customer.address.push(address._id);
        await customer.save();

        return address;
    }

    async GetProfile(customerId) {
        return CustomerModel
            .findById(customerId)
            .populate('address');
    }

    async RemoveAddress(customerId, addressId) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        const accepted = customer.address.filter(
            (id) => String(id) !== String(addressId)
        );

        customer.address = accepted;
        await customer.save();

        await AddressModel.deleteOne({ _id: addressId });

        return customer.address;
    }

    async GetWishList(customerId) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        return customer.wishlist;
    }

    async AddToWishlist(customerId, product) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        const productId = product._id.toString();

        if (!customer.wishlist.some((item) => String(item._id) === productId)) {
            customer.wishlist.push({
                ...product,
                _id: productId
            });

            await customer.save();
        }

        return customer.wishlist;
    }

    async RemoveFromWishlist(customerId, productId) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        customer.wishlist = customer.wishlist.filter(
            (item) => item._id !== productId
        );

        await customer.save();

        return customer.wishlist;
    }

    async AddToCart(customerId, product, qty) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        const productId = product._id.toString();

        const existingItem = customer.cart.find(
            (item) => String(item.product._id) === productId
        );

        if (existingItem) {
            existingItem.unit = qty;
        } else {
            customer.cart.push({
                product: {
                    ...product,
                    _id: productId
                },
                unit: qty
            });
        }

        await customer.save();

        return customer.cart;
    }

    async RemoveFromCart(customerId, productId) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        customer.cart = customer.cart.filter(
            (item) => item.product._id !== productId
        );

        await customer.save();

        return customer.cart;
    }

    async GetCart(customerId) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        return customer.cart;
    }

    async PlaceOrder(customerId, order) {
        const customer = await CustomerModel.findById(customerId);

        if (!customer) {
            throw new BadRequestError('Customer not found');
        }

        customer.orders.push(order);
        customer.cart = [];

        await customer.save();

        return order;
    }
}

module.exports = CustomerRepository;
