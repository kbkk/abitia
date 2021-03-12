import { Event } from '../Event';
import { EventBus } from '../EventBus';
import { EventBusCompositeCoordinator } from '../EventBusCompositeCoordinator';

class DummyEvent extends Event {
    public dummyProp = 'test';
}

const makeBusMock = (): jest.Mocked<EventBus> => ({
    publish: jest.fn(),
    subscribe: jest.fn(),
});

describe('EventBusCompositeCoordinator', () => {
    it('should deliver published event to registered buses', async () => {
        const coordinator = new EventBusCompositeCoordinator();
        const event = new DummyEvent();
        const bus1 = makeBusMock();
        const bus2 = makeBusMock();
        coordinator.registerChild(bus1);
        coordinator.registerChild(bus2);

        coordinator.publish(event);

        expect(bus1.publish).toHaveBeenCalledWith(event);
        expect(bus2.publish).toHaveBeenCalledWith(event);
    });
});
