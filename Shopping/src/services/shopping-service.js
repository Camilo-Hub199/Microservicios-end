const ShoppingRepository = require('../database/repository/shopping-repository');

class ShoppingService {

    constructor() {
        this.repository = new ShoppingRepository();
    }

    async PlaceOrder(customerId, txnId, items = []) {

        if (!customerId) {
            throw new Error('customerId is required');
        }

        const order = await this.repository.CreateNewOrder(
            customerId,
            txnId,
            items
        );

        return {
            data: order
        };
    }

    async GetOrders(customerId) {

        if (!customerId) {
            throw new Error('customerId is required');
        }

        const orders = await this.repository.Orders(customerId);

        return {
            data: orders
        };
    }
}

module.exports = ShoppingService;

