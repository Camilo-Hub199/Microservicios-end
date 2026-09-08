const OrderModel = require('../../src/database/models/Order');
const AddressModel = require('../../src/database/models/Address');

describe('Modelos Shopping', () => {

    test('OrderModel debe exponer los campos esperados', () => {

        expect(OrderModel.schema.paths.orderId).toBeDefined();
        expect(OrderModel.schema.paths.customerId).toBeDefined();
        expect(OrderModel.schema.paths.amount).toBeDefined();
        expect(OrderModel.schema.paths.status).toBeDefined();
        expect(OrderModel.schema.paths.txnId).toBeDefined();
        expect(OrderModel.schema.paths.items).toBeDefined();
    });

    test('OrderModel debe marcar los campos obligatorios', () => {

        expect(OrderModel.schema.paths.orderId.options.required).toBe(true);
        expect(OrderModel.schema.paths.customerId.options.required).toBe(true);
        expect(OrderModel.schema.paths.amount.options.required).toBe(true);
        expect(OrderModel.schema.paths.status.options.required).toBe(true);
    });

    test('AddressModel debe exponer los campos esperados', () => {

        expect(AddressModel.schema.paths.street).toBeDefined();
        expect(AddressModel.schema.paths.postalCode).toBeDefined();
        expect(AddressModel.schema.paths.city).toBeDefined();
        expect(AddressModel.schema.paths.country).toBeDefined();
    });

    test('AddressModel debe marcar street, city y country como obligatorios', () => {

        expect(AddressModel.schema.paths.street.options.required).toBe(true);
        expect(AddressModel.schema.paths.city.options.required).toBe(true);
        expect(AddressModel.schema.paths.country.options.required).toBe(true);
        expect(AddressModel.schema.paths.postalCode.options.required).toBeUndefined();
    });

});