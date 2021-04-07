import { EntityManager } from '@mikro-orm/core';

import { Event } from '../../../EventBus';
import { MikroOrmOutbox } from '../MikroOrmOutbox';
import { OutboxMessageEntity } from '../OutboxMessageEntity';

const entityManagerMock = {
    persist: jest.fn(),
} as unknown as jest.Mocked<EntityManager>;

class DummyEvent extends Event {
    public constructor(
        public dummyProp = 'test',
    ) {
        super();
    }
}

it('should serialize and persist the event', async () => {
    const outbox = new MikroOrmOutbox(entityManagerMock);
    const event = new DummyEvent();

    await outbox.send(event);

    expect(entityManagerMock.persist).toHaveBeenCalledWith({
        id: expect.any(String),
        createdAt: expect.any(Date),
        eventName: 'DummyEvent',
        eventPayload: JSON.stringify({ event }),
    } as OutboxMessageEntity);
});
