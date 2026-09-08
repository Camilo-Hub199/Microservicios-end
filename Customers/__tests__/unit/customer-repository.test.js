jest.mock('../../src/database/models', () => {
    const AddressModel = jest.fn((data) => ({ ...data }));

    AddressModel.create = jest.fn();

    const CustomerModel = jest.fn();

    CustomerModel.create = jest.fn();
    CustomerModel.findOne = jest.fn();
    CustomerModel.findById = jest.fn();

    return {
        CustomerModel,
        AddressModel
    };
});

const CustomerRepository = require('../../src/database/repository/customer-repository');
const { CustomerModel, AddressModel } = require('../../src/database/models');

describe('Customer Repository', () => {

    let repository;
    let logSpy;
    let errorSpy;

    beforeEach(() => {
        jest.resetAllMocks();
        repository = new CustomerRepository();
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
        errorSpy.mockRestore();
    });

    test('CreateCustomer debe crear un cliente con datos de sesión', async () => {

        const customer = {
            _id: 'cust-1',
            email: 'juan@gmail.com',
            password: 'hashed',
            salt: 'salt',
            phone: '3001234567'
        };

        CustomerModel.create.mockResolvedValue(customer);

        const result = await repository.CreateCustomer({
            email: 'juan@gmail.com',
            password: 'hashed',
            salt: 'salt',
            phone: '3001234567'
        });

        expect(CustomerModel.create).toHaveBeenCalledWith({
            email: 'juan@gmail.com',
            password: 'hashed',
            salt: 'salt',
            phone: '3001234567'
        });

        expect(result).toEqual(customer);
    });

    test('CreateCustomer debe lanzar BadRequestError cuando el email está duplicado', async () => {

        const dupError = new Error('duplicate');
        dupError.code = 11000;

        CustomerModel.create.mockRejectedValue(dupError);

        await expect(repository.CreateCustomer({
            email: 'juan@gmail.com',
            password: 'hashed',
            salt: 'salt',
            phone: '300'
        })).rejects.toThrow('Email already registered');

        expect(errorSpy).toHaveBeenCalled();
    });

    test('FindCustomer debe buscar el cliente por email', async () => {

        const customer = { _id: 'cust-1', email: 'juan@gmail.com' };

        CustomerModel.findOne.mockResolvedValue(customer);

        const result = await repository.FindCustomer({ email: 'juan@gmail.com' });

        expect(CustomerModel.findOne).toHaveBeenCalledWith({ email: 'juan@gmail.com' });

        expect(result).toEqual(customer);
    });

    test('AddNewAddress debe crear una dirección y asociarla al cliente', async () => {

        const save = jest.fn();

        const customer = {
            _id: 'cust-1',
            address: [],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        AddressModel.create.mockResolvedValue({
            _id: 'addr-1',
            street: 'Calle 1',
            postalCode: '11001',
            city: 'Bogotá',
            country: 'CO'
        });

        const result = await repository.AddNewAddress('cust-1', {
            street: 'Calle 1',
            postalCode: '11001',
            city: 'Bogotá',
            country: 'CO'
        });

        expect(CustomerModel.findById).toHaveBeenCalledWith('cust-1');
        expect(AddressModel.create).toHaveBeenCalledWith({
            street: 'Calle 1',
            postalCode: '11001',
            city: 'Bogotá',
            country: 'CO'
        });
        expect(customer.address).toContain('addr-1');
        expect(customer.save).toHaveBeenCalled();

        expect(result._id).toBe('addr-1');
    });

    test('AddNewAddress debe lanzar BadRequestError cuando el cliente no existe', async () => {

        CustomerModel.findById.mockResolvedValue(null);

        await expect(repository.AddNewAddress('cust-1', {
            street: 'Calle 1',
            postalCode: '11001',
            city: 'Bogotá',
            country: 'CO'
        })).rejects.toThrow('Customer not found');
    });

    test('GetProfile debe devolver el perfil populado', async () => {

        const populated = {
            _id: 'cust-1',
            email: 'juan@gmail.com',
            address: [{ _id: 'addr-1' }]
        };

        CustomerModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(populated)
        });

        const result = await repository.GetProfile('cust-1');

        expect(CustomerModel.findById).toHaveBeenCalledWith('cust-1');

        expect(result).toEqual(populated);
    });

    test('GetWishList debe devolver la wishlist del cliente', async () => {

        const wishlist = [{ _id: 'p-1' }, { _id: 'p-2' }];

        CustomerModel.findById.mockResolvedValue({ wishlist });

        const result = await repository.GetWishList('cust-1');

        expect(result).toEqual(wishlist);
    });

    test('GetWishList debe lanzar BadRequestError cuando el cliente no existe', async () => {

        CustomerModel.findById.mockResolvedValue(null);

        await expect(repository.GetWishList('cust-1')).rejects.toThrow('Customer not found');
    });

    test('AddToWishlist debe agregar un producto que no existe', async () => {

        const product = {
            _id: 'p-1',
            toObject: () => ({ _id: 'p-1', name: 'Producto' })
        };

        const save = jest.fn();

        const customer = {
            wishlist: [],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.AddToWishlist('cust-1', product);

        expect(result).toHaveLength(1);
        expect(result[0]._id).toBe('p-1');
        expect(customer.save).toHaveBeenCalled();
    });

    test('AddToWishlist no debe duplicar un producto existente', async () => {

        const product = {
            _id: 'p-1',
            toObject: () => ({ _id: 'p-1', name: 'Producto' })
        };

        const save = jest.fn();

        const customer = {
            wishlist: [{ _id: 'p-1', name: 'Producto' }],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.AddToWishlist('cust-1', product);

        expect(result).toHaveLength(1);
        expect(customer.save).not.toHaveBeenCalled();
    });

    test('RemoveFromWishlist debe eliminar el producto', async () => {

        const save = jest.fn();

        const customer = {
            wishlist: [{ _id: 'p-1' }, { _id: 'p-2' }],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.RemoveFromWishlist('cust-1', 'p-1');

        expect(result).toEqual([{ _id: 'p-2' }]);
        expect(customer.save).toHaveBeenCalled();
    });

    test('AddToCart debe agregar un producto nuevo', async () => {

        const product = {
            _id: 'p-1',
            toObject: () => ({ _id: 'p-1', name: 'Producto' })
        };

        const save = jest.fn();

        const customer = {
            cart: [],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.AddToCart('cust-1', product, 2);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ unit: 2 });
        expect(customer.save).toHaveBeenCalled();
    });

    test('AddToCart debe actualizar la cantidad de un producto existente', async () => {

        const product = {
            _id: 'p-1',
            toObject: () => ({ _id: 'p-1', name: 'Producto' })
        };

        const save = jest.fn();

        const customer = {
            cart: [{ product: { _id: 'p-1', name: 'Producto' }, unit: 1 }],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.AddToCart('cust-1', product, 5);

        expect(result).toHaveLength(1);
        expect(result[0].unit).toBe(5);
        expect(customer.save).toHaveBeenCalled();
    });

    test('RemoveFromCart debe eliminar el producto del carrito', async () => {

        const save = jest.fn();

        const customer = {
            cart: [
                { product: { _id: 'p-1' }, unit: 1 },
                { product: { _id: 'p-2' }, unit: 3 }
            ],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.RemoveFromCart('cust-1', 'p-1');

        expect(result).toEqual([{ product: { _id: 'p-2' }, unit: 3 }]);
        expect(customer.save).toHaveBeenCalled();
    });

    test('GetCart debe devolver el carrito del cliente', async () => {

        const cart = [{ product: { _id: 'p-1' }, unit: 2 }];

        CustomerModel.findById.mockResolvedValue({ cart });

        const result = await repository.GetCart('cust-1');

        expect(result).toEqual(cart);
    });

    test('PlaceOrder debe registrar la orden y vaciar el carrito', async () => {

        const order = {
            _id: 'o-1',
            amount: 5000,
            status: 'received'
        };

        const save = jest.fn();

        const customer = {
            cart: [{ product: { _id: 'p-1' }, unit: 2 }],
            orders: [],
            save
        };

        save.mockResolvedValue(customer);

        CustomerModel.findById.mockResolvedValue(customer);

        const result = await repository.PlaceOrder('cust-1', order);

        expect(customer.orders).toContain(order);
        expect(customer.cart).toEqual([]);
        expect(customer.save).toHaveBeenCalled();

        expect(result).toEqual(order);
    });

});