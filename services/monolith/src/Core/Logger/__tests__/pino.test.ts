import { Writable } from 'stream';

import { PinoLogger } from '../PinoLogger';
import { pinoFactory } from '../pinoFactory';

const writeMock = jest.fn();

const testStream = new Writable({
    write: writeMock,
});

const pino = pinoFactory({ prettyPrint: false }, testStream);

const pinoLogger = new PinoLogger(pino);

beforeEach(() => {
    jest.resetAllMocks();
});

class CustomError extends Error {
    public testProperty = 'testValue';
}

it('should serialize errors', () => {
    const error = new Error('testError');

    pinoLogger.info('some message', {
        error,
        err: error,
        other: error,
    });

    expect(writeMock).toHaveBeenCalled();

    const log = JSON.parse(writeMock.mock.calls[0][0].toString());

    expect(log.error).toMatchObject({
        type: expect.any(String),
        message: expect.any(String),
        stack: expect.any(String),
    });
    expect(log.err).toMatchObject({
        type: expect.any(String),
        message: expect.any(String),
        stack: expect.any(String),
    });
    // Only 'err' and 'error' properties will properly serialize errors
    expect(log.other).toEqual({});
});

it('should serialize errors with additional properties', () => {
    const error = new CustomError('customError');

    pinoLogger.info('some message', { error });

    const log = JSON.parse(writeMock.mock.calls[0][0].toString());

    expect(log.error).toMatchObject({
        type: 'CustomError',
        testProperty: 'testValue',
    });
});
