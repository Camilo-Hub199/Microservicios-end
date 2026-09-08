jest.mock('../../src/database', () => ({
    CustomerRepository: jest.fn()
}));

jest.mock('../../src/utils', () => ({
    FormateData: jest.fn((data) => ({ data })),
    GenerateSalt: jest.fn().mockResolvedValue('salt'),
    GeneratePassword: jest.fn().mockResolvedValue('hashed-password'),
    GenerateSignature: jest.fn().mockResolvedValue('token-123'),
    ValidatePassword: jest.fn()
}));

const CustomerService = require('../../src/services/customer-service');
const { CustomerRepository } = require('../../src/database');
const {
    FormateData,
    GenerateSalt,
    GeneratePassword,
    GenerateSignature,
    ValidatePassword
} = require('../../src/utils');

const { BadRequestError } = require('../../src/utils/app-errors');

describe('Customer Service', () => {

    let service;
    let mockRepository;

    beforeEach(() => {
        jest.resetAllMocks();

        FormateData.mockImplementation((data) => ({ data }));
        GenerateSalt.mockResolvedValue('salt');
        GeneratePassword.mockResolvedValue('hashed-password');
        GenerateSignature.mockResolvedValue('token-123');

        mockRepository = {
            FindCustomer: jest.fn(),
            CreateCustomer: jest.fn(),
            AddNewAddress: jest.fn(),
            GetProfile: jest.fn(),
            GetWishList: jest.fn(),
            AddToWishlist: jest.fn(),
            RemoveFromWishlist: jest.fn(),
            AddToCart: jest.fn(),
            RemoveFromCart: jest.fn(),
            GetCart: jest.fn(),
            PlaceOrder: jest.fn()
        };

        CustomerRepository.mockImplementation(() => mockRepository);

        service = new CustomerService();
    });

    test('debe crear correctamente una instancia con su repositorio', () => {

        expect(service).toBeInstanceOf(CustomerService);
        expect(service.repository).toBe(mockRepository);
    });

    describe('SignIn', () => {

        test('debe iniciar sesión cuando el password es válido', async () => {

            const existingCustomer = {
                _id: 'cust-1',
                email: 'juan@gmail.com',
                password: 'hashed-password',
                salt: 'salt'
            };

            ValidatePassword.mockResolvedValue(true);

            mockRepository.FindCustomer.mockResolvedValue(existingCustomer);

            GenerateSignature.mockResolvedValue('token-123');

            const result = await service.SignIn({
                email: 'juan@gmail.com',
                password: 'password123'
            });

            expect(mockRepository.FindCustomer).toHaveBeenCalledWith({ email: 'juan@gmail.com' });
            expect(ValidatePassword).toHaveBeenCalledWith('password123', 'hashed-password', 'salt');
            expect(GenerateSignature).toHaveBeenCalledWith({
                email: 'juan@gmail.com',
                _id: 'cust-1'
            });
            expect(result).toEqual({ data: { id: 'cust-1', token: 'token-123' } });
        });

        test('debe lanzar BadRequestError cuando el password es inválido', async () => {

            const existingCustomer = {
                _id: 'cust-1',
                email: 'juan@gmail.com',
                password: 'hashed-password',
                salt: 'salt'
            };

            ValidatePassword.mockResolvedValue(false);

            mockRepository.FindCustomer.mockResolvedValue(existingCustomer);

            await expect(service.SignIn({ email: 'juan@gmail.com', password: 'incorrecta' }))
                .rejects.toBeInstanceOf(BadRequestError);

            await expect(service.SignIn({ email: 'juan@gmail.com', password: 'incorrecta' }))
                .rejects.toThrow('Invalid credentials');
        });

        test('debe lanzar BadRequestError cuando el cliente no existe', async () => {

            mockRepository.FindCustomer.mockResolvedValue(null);

            await expect(service.SignIn({ email: 'nadie@gmail.com', password: 'password123' }))
                .rejects.toBeInstanceOf(BadRequestError);
        });

    });

    describe('SignUp', () => {

        test('debe crear un cliente y devolver id y token', async () => {

            const newCustomer = {
                _id: 'cust-1',
                email: 'juan@gmail.com'
            };

            GenerateSalt.mockResolvedValue('salt');
            GeneratePassword.mockResolvedValue('hashed-password');

            mockRepository.CreateCustomer.mockResolvedValue(newCustomer);

            GenerateSignature.mockResolvedValue('token-123');

            const result = await service.SignUp({
                email: 'juan@gmail.com',
                password: 'password123',
                phone: '3001234567'
            });

            expect(GenerateSalt).toHaveBeenCalled();
            expect(GeneratePassword).toHaveBeenCalledWith('password123', 'salt');
            expect(mockRepository.CreateCustomer).toHaveBeenCalledWith({
                email: 'juan@gmail.com',
                password: 'hashed-password',
                phone: '3001234567',
                salt: 'salt'
            });
            expect(result).toEqual({ data: { id: 'cust-1', token: 'token-123' } });
        });

        test('debe propagar un APIError del repositorio', async () => {

            mockRepository.CreateCustomer.mockRejectedValue(new BadRequestError('Email already registered'));

            await expect(service.SignUp({ email: 'juan@gmail.com', password: 'password123', phone: '300' }))
                .rejects.toThrow('Email already registered');
        });

    });

    describe('AddNewAddress', () => {

        test('debe agregar una dirección y formatear la data', async () => {

            const address = {
                _id: 'addr-1',
                street: 'Calle 1',
                postalCode: '11001',
                city: 'Bogotá',
                country: 'CO'
            };

            mockRepository.AddNewAddress.mockResolvedValue(address);

            const result = await service.AddNewAddress('cust-1', {
                street: 'Calle 1',
                postalCode: '11001',
                city: 'Bogotá',
                country: 'CO'
            });

            expect(mockRepository.AddNewAddress).toHaveBeenCalledWith('cust-1', {
                street: 'Calle 1',
                postalCode: '11001',
                city: 'Bogotá',
                country: 'CO'
            });

            expect(result).toEqual({ data: address });
        });

    });

    describe('GetProfile', () => {

        test('debe devolver el perfil del cliente', async () => {

            const profile = {
                _id: 'cust-1',
                email: 'juan@gmail.com',
                phone: '3001234567'
            };

            mockRepository.GetProfile.mockResolvedValue(profile);

            const result = await service.GetProfile({ _id: 'cust-1' });

            expect(mockRepository.GetProfile).toHaveBeenCalledWith('cust-1');

            expect(result).toEqual({ data: profile });
        });

    });

    describe('GetShopingDetails', () => {

        test('debe devolver los detalles de compra del cliente', async () => {

            const profile = {
                cart: [{ product: { _id: 'p-1' }, unit: 2 }],
                wishlist: [{ _id: 'p-1' }],
                orders: [{ orderId: 'o-1' }]
            };

            mockRepository.GetProfile.mockResolvedValue(profile);

            const result = await service.GetShopingDetails('cust-1');

            expect(result).toEqual({
                data: {
                    cart: profile.cart,
                    wishlist: profile.wishlist,
                    orders: profile.orders
                }
            });
        });

    });

    describe('GetWishList', () => {

        test('debe devolver la wishlist del cliente', async () => {

            const wishlist = [{ _id: 'p-1' }, { _id: 'p-2' }];

            mockRepository.GetWishList.mockResolvedValue(wishlist);

            const result = await service.GetWishList('cust-1');

            expect(mockRepository.GetWishList).toHaveBeenCalledWith('cust-1');

            expect(result).toEqual({ data: wishlist });
        });

    });

    describe('AddToWishlist', () => {

        test('debe agregar un producto a la wishlist', async () => {

            const product = { _id: 'p-1', name: 'Producto' };

            const wishlist = [{ _id: 'p-1', name: 'Producto' }];

            mockRepository.AddToWishlist.mockResolvedValue(wishlist);

            const result = await service.AddToWishlist('cust-1', product);

            expect(mockRepository.AddToWishlist).toHaveBeenCalledWith('cust-1', product);

            expect(result).toEqual({ data: wishlist });
        });

    });

    describe('RemoveFromWishlist', () => {

        test('debe eliminar un producto de la wishlist', async () => {

            const wishlist = [{ _id: 'p-2' }];

            mockRepository.RemoveFromWishlist.mockResolvedValue(wishlist);

            const result = await service.RemoveFromWishlist('cust-1', 'p-1');

            expect(mockRepository.RemoveFromWishlist).toHaveBeenCalledWith('cust-1', 'p-1');

            expect(result).toEqual({ data: wishlist });
        });

    });

    describe('AddToCart', () => {

        test('debe agregar un producto al carrito', async () => {

            const product = { _id: 'p-1', name: 'Producto' };

            const cart = [{ product: { _id: 'p-1' }, unit: 2 }];

            mockRepository.AddToCart.mockResolvedValue(cart);

            const result = await service.AddToCart('cust-1', product, 2);

            expect(mockRepository.AddToCart).toHaveBeenCalledWith('cust-1', product, 2);

            expect(result).toEqual({ data: cart });
        });

    });

    describe('RemoveFromCart', () => {

        test('debe eliminar un producto del carrito', async () => {

            const cart = [];

            mockRepository.RemoveFromCart.mockResolvedValue(cart);

            const result = await service.RemoveFromCart('cust-1', 'p-1');

            expect(mockRepository.RemoveFromCart).toHaveBeenCalledWith('cust-1', 'p-1');

            expect(result).toEqual({ data: cart });
        });

    });

    describe('GetCart', () => {

        test('debe devolver el carrito del cliente', async () => {

            const cart = [{ product: { _id: 'p-1' }, unit: 2 }];

            mockRepository.GetCart.mockResolvedValue(cart);

            const result = await service.GetCart('cust-1');

            expect(mockRepository.GetCart).toHaveBeenCalledWith('cust-1');

            expect(result).toEqual({ data: cart });
        });

    });

    describe('PlaceOrder', () => {

        test('debe realizar la orden y formatear la data', async () => {

            const order = {
                _id: 'o-1',
                amount: 5000,
                status: 'received'
            };

            mockRepository.PlaceOrder.mockResolvedValue(order);

            const result = await service.PlaceOrder('cust-1', order);

            expect(mockRepository.PlaceOrder).toHaveBeenCalledWith('cust-1', order);

            expect(result).toEqual({ data: order });
        });

    });

});