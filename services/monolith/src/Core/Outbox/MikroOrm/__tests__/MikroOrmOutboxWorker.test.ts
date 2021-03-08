import { EntityManager } from '@mikro-orm/core';

import { EventBus } from '../../../EventBus';
import { TestLogger } from '../../../Testing';
import { MikroOrmOutboxWorker } from '../MikroOrmOutboxWorker';
import { OutboxMessageEntity } from '../OutboxMessageEntity';

const entityManagerMock = {
    persistAndFlush: jest.fn(),
    find: jest.fn(),
    fork: () => entityManagerMock,
} as unknown as jest.Mocked<EntityManager>;

const eventBusMock = {
    publish: jest.fn(),
    subscribe: jest.fn(),
} as jest.Mocked<EventBus>;

const dummyMessage = new OutboxMessageEntity(
    'test-id',
    'TestEvent',
    JSON.stringify({ prop1: 'test' }),
);

const logger = new TestLogger();

const worker = new MikroOrmOutboxWorker(entityManagerMock, eventBusMock, logger, { fetchDelay: 50 });

beforeEach(() => {
    jest.resetAllMocks();
});

afterEach(async () => {
    await worker.stop();
});

async function waitUntil({ condition, timeout = 5000, repeatEvery = 1000 }): Promise<void> {
    const poll = async (resolve): Promise<void> => {
        try {
            const result = await condition();

            if (result) {
                return resolve();
            }
        } catch (err) {
            console.error('waitUntil condition function has rejected', err);
        }

        setTimeout(() => poll(resolve), repeatEvery);
    };

    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('waitUntil condition not met in time')), timeout);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        poll(resolve);
    });
}

it('should continue processing if an error occurred', async () => {
    const error = new Error('Test error');
    entityManagerMock
        .find
        .mockRejectedValueOnce(error)
        .mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    worker.start();

    await waitUntil({
        condition: () => entityManagerMock.find.mock.calls.length > 2,
        repeatEvery: 100,
    });

    await worker.stop();

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Failed to process outbox messages', { error });
});


it('should pickup outbox messages and publish them to event bus', async () => {
    entityManagerMock
        .find
        .mockResolvedValueOnce([dummyMessage])
        .mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    worker.start();
    await worker.stop();

    const calledWith = eventBusMock.publish.mock.calls[0][0];
    expect(calledWith).toEqual({
        prop1: 'test',
    });
    expect(calledWith).toHaveProperty('constructor.name', 'TestEvent');
});
