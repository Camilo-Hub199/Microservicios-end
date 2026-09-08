jest.mock('../../src/database', () => ({
    ProductRepository: jest.fn()
}));

const ProductsService = require('../../src/services/products-service');
const { ProductRepository } = require('../../src/database');

const { NotFoundError } = require('../../src/utils/app-errors');

describe('Products Service', () => {

    let service;
    let mockRepository;

    beforeEach(() => {
        jest.resetAllMocks();

        mockRepository = {
            FindAll: jest.fn(),
            FindById: jest.fn()
        };

        ProductRepository.mockImplementation(() => mockRepository);

        service = new ProductsService();
    });

    test('debe crear correctamente una instancia con su repositorio', () => {

        expect(service).toBeInstanceOf(ProductsService);
        expect(service.repository).toBe(mockRepository);
    });

    describe('GetProducts', () => {

        test('debe devolver productos y categorías únicas', async () => {

            const products = [
                { _id: 'p-1', name: 'Pizza', type: 'Comida' },
                { _id: 'p-2', name: 'Hamburguesa', type: 'Comida' },
                { _id: 'p-3', name: 'Jugo', type: 'Bebida' }
            ];

            mockRepository.FindAll.mockResolvedValue(products);

            const result = await service.GetProducts();

            expect(mockRepository.FindAll).toHaveBeenCalled();

            expect(result).toEqual({
                data: {
                    products,
                    categories: ['Comida', 'Bebida']
                }
            });
        });

        test('debe devolver categorías vacías cuando no hay productos', async () => {

            mockRepository.FindAll.mockResolvedValue([]);

            const result = await service.GetProducts();

            expect(result).toEqual({
                data: {
                    products: [],
                    categories: []
                }
            });
        });

        test('debe lanzar APIError cuando falla el repositorio', async () => {

            mockRepository.FindAll.mockRejectedValue(new Error('fallo en la BD'));

            await expect(service.GetProducts()).rejects.toThrow('fallo en la BD');
        });

    });

    describe('GetProductById', () => {

        test('debe devolver el producto formateado', async () => {

            const product = {
                _id: 'p-1',
                name: 'Pizza',
                type: 'Comida'
            };

            mockRepository.FindById.mockResolvedValue(product);

            const result = await service.GetProductById('p-1');

            expect(mockRepository.FindById).toHaveBeenCalledWith('p-1');

            expect(result).toEqual({ data: product });
        });

        test('debe propagar un NotFoundError cuando el producto no existe', async () => {

            mockRepository.FindById.mockRejectedValue(new NotFoundError('Product not found'));

            await expect(service.GetProductById('p-999')).rejects.toBeInstanceOf(NotFoundError);

            await expect(service.GetProductById('p-999')).rejects.toThrow('Product not found');
        });

        test('debe lanzar APIError cuando falla el repositorio', async () => {

            mockRepository.FindById.mockRejectedValue(new Error('fallo en la BD'));

            await expect(service.GetProductById('p-1')).rejects.toThrow('fallo en la BD');
        });

    });

});