const { OrderModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class ShoppingRepository {

    async Orders(customerId) {
        try {
            const orders = await OrderModel.find({ customerId });
            return orders;
        } catch (err) {
            console.error('Error buscando órdenes:', err);

            throw new APIError(
                'API Error',
                STATUS_CODES.INTERNAL_ERROR,
                'Unable to Find Orders'
            );
        }
    }

    async CreateNewOrder(customerId, txnId, items = []) {
        try {

            const orderId = uuidv4();

            const amount = items.reduce((total, item) => {
                const price = Number(item.product?.price || 0);
                const unit = Number(item.unit || 0);

                return total + (price * unit);
            }, 0);

            const order = new OrderModel({
                orderId,
                customerId,
                txnId: txnId || null,
                status: 'received',
                amount,
                items
            });

            const orderResult = await order.save();

            return orderResult;

        } catch (err) {

            console.error('Error creando orden:', err);

            throw new APIError(
                'API Error',
                STATUS_CODES.INTERNAL_ERROR,
                'Unable to Create Order'
            );
        }
    }
}

module.exports = ShoppingRepository;

