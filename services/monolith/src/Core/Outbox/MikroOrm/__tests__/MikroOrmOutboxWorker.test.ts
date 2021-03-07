import { EntityManager } from '@mikro-orm/core';

import { EventBus } from '../../../EventBus';
import { MikroOrmOutboxWorker } from '../MikroOrmOutboxWorker';
import { OutboxMessageEntity } from '../OutboxMessageEntity';

const entityManagerMock = {
    persistAndFlush: jest.fn(),
    find: jest.fn(),
    fork: () => entityManagerMock,
} as unknown as jest.Mocked<EntityManager>;

const dummyMessage = new OutboxMessageEntity(
    'test-id',
    'TestEvent',
    JSON.stringify({ prop1: 'test' }),
);

const worker = new MikroOrmOutboxWorker(entityManagerMock);

afterEach(async () => {
    await worker.stop();
});

it('should pickup outbox messages and publish them to event bus', async () => {
    entityManagerMock
        .find
        .mockResolvedValueOnce([dummyMessage])
        .mockResolvedValue([]);

    const eventBus = {
        publish: jest.fn(),
        subscribe: jest.fn(),
    } as jest.Mocked<EventBus>;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    worker.start(eventBus);
    await worker.stop();

    const calledWith = eventBus.publish.mock.calls[0][0];
    expect(calledWith).toEqual({
        prop1: 'test',
    });
    expect(calledWith).toHaveProperty('constructor.name', 'TestEvent');
});
