import { TestLogger } from '../../../Testing';
import { NestJsLoggerAdapter } from '../NestJsLoggerAdapter';

const loggerMock = new TestLogger();
const loggerAdapter = new NestJsLoggerAdapter(loggerMock);

beforeEach(() => {
    jest.clearAllMocks();
});

it('should log without context param', () => {
    loggerAdapter.verbose('testMessage');
    expect(loggerMock.debug).toHaveBeenCalledWith('testMessage');
});

it('should log verbose()', () => {
    loggerAdapter.verbose('testMessage', 'testContext');
    expect(loggerMock.debug).toHaveBeenCalledWith('[testContext] testMessage');
});

it('should log debug()', () => {
    loggerAdapter.debug('testMessage', 'testContext');
    expect(loggerMock.debug).toHaveBeenCalledWith('[testContext] testMessage');
});

it('should log log()', () => {
    loggerAdapter.log('testMessage', 'testContext');
    expect(loggerMock.info).toHaveBeenCalledWith('[testContext] testMessage');
});

it('should log warn()', () => {
    loggerAdapter.warn('testMessage', 'testContext');
    expect(loggerMock.warn).toHaveBeenCalledWith('[testContext] testMessage');
});

it('should log error()', () => {
    loggerAdapter.error('testMessage', 'testTrace', 'testContext');
    expect(loggerMock.error).toHaveBeenCalledWith('[testContext] testMessage', { trace: 'testTrace' });
});
