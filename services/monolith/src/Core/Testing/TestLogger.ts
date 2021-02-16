import { Logger } from '../Logger';

export class TestLogger implements Logger {
    public debug = jest.fn();

    public error = jest.fn();

    public info = jest.fn();

    public warn = jest.fn();
}
