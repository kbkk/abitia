import { Event } from '../Event';
import { InMemoryEventBus } from '../InMemoryEventBus';

class DummyEvent extends Event {
    public dummyProp = 'test';
}

describe('EventBus', () => {
    it('should deliver published event to a subscriber', async () => {
        const eventBus = new InMemoryEventBus();
        const event = new DummyEvent();
        const subscriber = jest.fn();

        eventBus.subscribe(DummyEvent, subscriber);
        eventBus.publish(event);

        expect(subscriber).toHaveBeenCalledWith(event);
    });

    it('publish() should ignore subscriber failures', async () => {
        const eventBus = new InMemoryEventBus();
        const event = new DummyEvent();
        const subscriber = jest.fn().mockRejectedValue('testRejection');

        eventBus.subscribe(DummyEvent, subscriber);
        eventBus.publish(event);

        expect(subscriber).toHaveBeenCalledWith(event);
    });
});
