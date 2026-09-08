jest.mock('../../src/database/models', () => {
    const ProductModel = jest.fn();

    ProductModel.find = jest.fn();
    ProductModel.findById = jest.fn();

    return {
        ProductModel
    };
});

const ProductRepository = require('../../src/database/repository/product-repository');
const { ProductModel } = require('../../src/database/models');

describe('Product Repository', () => {

    let repository;

    beforeEach(() => {
        jest.resetAllMocks();
        repository = new ProductRepository();
    });

    test('FindAll debe devolver todos los productos', async () => {

        const products = [
            { _id: 'p-1', name: 'Pizza', type: 'Comida' },
            { _id: 'p-2', name: 'Jugo', type: 'Bebida' }
        ];

        ProductModel.find.mockResolvedValue(products);

        const result = await repository.FindAll();

        expect(ProductModel.find).toHaveBeenCalledWith({});

        expect(result).toEqual(products);
    });

    test('FindById debe devolver el producto encontrado', async () => {

        const product = { _id: 'p-1', name: 'Pizza', type: 'Comida' };

        ProductModel.findById.mockResolvedValue(product);

        const result = await repository.FindById('p-1');

        expect(ProductModel.findById).toHaveBeenCalledWith('p-1');

        expect(result).toEqual(product);
    });

    test('FindById debe lanzar NotFoundError cuando el producto no existe', async () => {

        ProductModel.findById.mockResolvedValue(null);

        await expect(repository.FindById('p-999'))
            .rejects.toThrow('Product not found');
    });

});