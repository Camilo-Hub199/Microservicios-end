jest.mock('../../src/database/repository/shopping-repository');

const ShoppingService = require('../../src/services/shopping-service');
const ShoppingRepository = require('../../src/database/repository/shopping-repository');

describe('Shopping Service', () => {

    let service;
    let mockRepository;

    beforeEach(() => {
        jest.resetAllMocks();

        mockRepository = {
            CreateNewOrder: jest.fn(),
            Orders: jest.fn()
        };

        ShoppingRepository.mockImplementation(() => mockRepository);

        service = new ShoppingService();
    });

    test('debe crear correctamente una instancia con su repositorio', () => {

        expect(service).toBeInstanceOf(ShoppingService);
        expect(service.repository).toBe(mockRepository);
    });

    test('PlaceOrder debe crear una orden y formatear la data', async () => {

        const order = {
            orderId: 'ord-123',
            customerId: 'cust-1',
            amount: 2000
        };

        mockRepository.CreateNewOrder.mockResolvedValue(order);

        const items = [
            { product: { price: 1000 }, unit: 2 }
        ];

        const result = await service.PlaceOrder('cust-1', 'txn-1', items);

        expect(mockRepository.CreateNewOrder).toHaveBeenCalledWith('cust-1', 'txn-1', items);

        expect(result).toEqual({ data: order });
    });

    test('PlaceOrder debe lanzar error cuando falta el customerId', async () => {

        await expect(service.PlaceOrder(null, 'txn-1'))
            .rejects.toThrow('customerId is required');

        expect(mockRepository.CreateNewOrder).not.toHaveBeenCalled();
    });

    test('GetOrders debe devolver las órdenes del cliente', async () => {

        const orders = [
            { orderId: 'ord-1', customerId: 'cust-1' },
            { orderId: 'ord-2', customerId: 'cust-1' }
        ];

        mockRepository.Orders.mockResolvedValue(orders);

        const result = await service.GetOrders('cust-1');

        expect(mockRepository.Orders).toHaveBeenCalledWith('cust-1');

        expect(result).toEqual({ data: orders });
    });

    test('GetOrders debe lanzar error cuando falta el customerId', async () => {

        await expect(service.GetOrders(null))
            .rejects.toThrow('customerId is required');

        expect(mockRepository.Orders).not.toHaveBeenCalled();
    });

});