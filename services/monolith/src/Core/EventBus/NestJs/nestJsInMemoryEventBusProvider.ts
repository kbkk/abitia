import { Logger, LOGGER } from '../../Logger';
import { EVENT_BUS } from '../EventBus';
import { InMemoryEventBus } from '../InMemoryEventBus';

export const nestJsInMemoryEventBusProvider = {
    provide: EVENT_BUS,
    useFactory: (logger: Logger) => {
        return new InMemoryEventBus(logger);
    },
    inject: [LOGGER],
};
