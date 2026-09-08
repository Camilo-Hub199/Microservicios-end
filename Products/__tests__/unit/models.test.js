const ProductModel = require('../../src/database/models/Product');
const AddressModel = require('../../src/database/models/Address');

describe('Modelos Products', () => {

    test('ProductModel debe exponer los campos esperados', () => {

        expect(ProductModel.schema.paths.name).toBeDefined();
        expect(ProductModel.schema.paths.desc).toBeDefined();
        expect(ProductModel.schema.paths.type).toBeDefined();
        expect(ProductModel.schema.paths.banner).toBeDefined();
        expect(ProductModel.schema.paths.price).toBeDefined();
        expect(ProductModel.schema.paths.available).toBeDefined();
    });

    test('ProductModel debe marcar name, type y price como obligatorios', () => {

        expect(ProductModel.schema.paths.name.options.required).toBe(true);
        expect(ProductModel.schema.paths.type.options.required).toBe(true);
        expect(ProductModel.schema.paths.price.options.required).toBe(true);
    });

    test('ProductModel debe marcar available con valor por defecto true', () => {

        expect(ProductModel.schema.paths.available.options.default).toBe(true);
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