import { TestLogger, waitMs } from '../../Testing';
import { Event } from '../Event';
import { InMemoryEventBus } from '../InMemoryEventBus';

class DummyEvent extends Event {
    public dummyProp = 'test';
}

describe('EventBus', () => {
    it('should deliver published event to subscribers', async () => {
        const eventBus = new InMemoryEventBus();
        const event = new DummyEvent();
        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();

        eventBus.subscribe(DummyEvent, subscriber1);
        eventBus.subscribe(DummyEvent, subscriber2);
        eventBus.publish(event);
        await waitMs(10);

        expect(subscriber1).toHaveBeenCalledWith(event);
        expect(subscriber2).toHaveBeenCalledWith(event);
    });

    it('publish() should ignore subscriber failures', async () => {
        const eventBus = new InMemoryEventBus();
        const event = new DummyEvent();
        const subscriber = jest.fn().mockRejectedValue('testRejection');

        eventBus.subscribe(DummyEvent, subscriber);
        eventBus.publish(event);
        await waitMs(10);

        expect(subscriber).toHaveBeenCalledWith(event);
    });

    it('publish() should ignore and log on invalid event', async () => {
        const logger = new TestLogger();
        const eventBus = new InMemoryEventBus(logger);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventBus.publish(undefined as any);
        await waitMs(10);

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to run subscribers',
            expect.any(TypeError),
        );
    });
});
