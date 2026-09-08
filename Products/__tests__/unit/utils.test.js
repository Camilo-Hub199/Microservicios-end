const { FormateData } = require('../../src/utils');

describe('Utils Products', () => {

    test('FormateData debe envolver la data dentro de un objeto', () => {

        const result = FormateData({ a: 1 });

        expect(result).toEqual({ data: { a: 1 } });
    });

    test('FormateData debe envolver datos primitivos', () => {

        const result = FormateData('hola');

        expect(result).toEqual({ data: 'hola' });
    });

});