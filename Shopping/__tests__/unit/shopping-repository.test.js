jest.mock('../../src/database/models', () => {
    const OrderModel = jest.fn(() => ({
        save: jest.fn()
    }));

    OrderModel.find = jest.fn();

    return {
        OrderModel,
        AddressModel: jest.fn()
    };
});

const ShoppingRepository = require('../../src/database/repository/shopping-repository');
const { OrderModel } = require('../../src/database/models');

describe('Shopping Repository', () => {

    let repository;

    beforeEach(() => {
        jest.resetAllMocks();
        repository = new ShoppingRepository();
    });

    test('Orders debe devolver las órdenes del cliente', async () => {

        const orders = [
            { orderId: 'ord-1', customerId: 'cust-1' }
        ];

        OrderModel.find.mockResolvedValue(orders);

        const result = await repository.Orders('cust-1');

        expect(OrderModel.find).toHaveBeenCalledWith({ customerId: 'cust-1' });

        expect(result).toEqual(orders);
    });

    test('Orders debe lanzar APIError cuando falla la consulta', async () => {

        OrderModel.find.mockRejectedValue(new Error('fallo en la BD'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(repository.Orders('cust-1')).rejects.toThrow('Unable to Find Orders');

        expect(console.error).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    test('CreateNewOrder debe calcular el monto y guardar la orden', async () => {

        const items = [
            { product: { price: 100 }, unit: 2 },
            { product: { price: 50 }, unit: 1 }
        ];

        let instanceData;

        OrderModel.mockImplementation((data) => {
            instanceData = data;
            return {
                save: jest.fn().mockResolvedValue({ ...data, _id: 'ord-1' })
            };
        });

        OrderModel.find.mockRejectedValue(new Error('nunca usado'));

        const result = await repository.CreateNewOrder('cust-1', 'txn-1', items);

        expect(OrderModel).toHaveBeenCalled();

        expect(instanceData).toMatchObject({
            customerId: 'cust-1',
            txnId: 'txn-1',
            status: 'received',
            amount: 250
        });

        expect(result._id).toBe('ord-1');
    });

    test('CreateNewOrder debe usar txnId nulo cuando no se provee', async () => {

        let instanceData;

        OrderModel.mockImplementation((data) => {
            instanceData = data;
            return { save: jest.fn().mockResolvedValue(data) };
        });

        await repository.CreateNewOrder('cust-1', null, []);

        expect(instanceData.txnId).toBeNull();
    });

    test('CreateNewOrder debe lanzar APIError cuando falla el guardado', async () => {

        OrderModel.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('fallo en el guardado'))
        }));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(repository.CreateNewOrder('cust-1', 'txn-1', []))
            .rejects.toThrow('Unable to Create Order');

        expect(console.error).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

});