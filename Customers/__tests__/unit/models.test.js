const CustomerModel = require('../../src/database/models/Customer');
const AddressModel = require('../../src/database/models/Address');

describe('Modelos Customers', () => {

    test('CustomerModel debe exponer los campos esperados', () => {

        expect(CustomerModel.schema.paths.email).toBeDefined();
        expect(CustomerModel.schema.paths.password).toBeDefined();
        expect(CustomerModel.schema.paths.salt).toBeDefined();
        expect(CustomerModel.schema.paths.phone).toBeDefined();
        expect(CustomerModel.schema.paths.address).toBeDefined();
        expect(CustomerModel.schema.paths.cart).toBeDefined();
        expect(CustomerModel.schema.paths.wishlist).toBeDefined();
        expect(CustomerModel.schema.paths.orders).toBeDefined();
    });

    test('CustomerModel debe marcar el email como único', () => {

        expect(CustomerModel.schema.paths.email.options.unique).toBe(true);
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
    });

});