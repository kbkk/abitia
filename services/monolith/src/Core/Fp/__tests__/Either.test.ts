import { assertLeft, assertRight, left, match, right } from '../Either';

describe('match()', () => {
    it('should execute onLeft callback if Left Either is passed', () => {
        match(
            left('left'),
            (value) => expect(value).toEqual('left'),
            () => { throw new Error('expected to go left'); },
        );
    });

    it('should execute onRight callback if Right Either is passed', () => {
        match(
            right('right'),
            () => { throw new Error('expected to go right'); },
            (value) => expect(value).toEqual('right'),
        );
    });
});

describe('assertLeft()', () => {
    it('should throw if passed a Right Either', () => {
        expect(
            () => assertLeft(right('right')),
        ).toThrowError(
            'Expected a Left Either',
        );
    });
});

describe('assertRight()', () => {
    it('should throw if passed a Left Either', () => {
        expect(
            () => assertRight(left('left')),
        ).toThrowError(
            'Expected a Right Either',
        );
    });
});
