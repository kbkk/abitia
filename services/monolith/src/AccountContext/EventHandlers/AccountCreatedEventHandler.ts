import { Inject, Injectable } from '@nestjs/common';

import { Event, EVENT_BUS, EventBus } from '../../Core/EventBus';
import { AccountCreatedEvent } from '../Events/AccountCreatedEvent';

@Injectable()
export class AccountCreatedEventHandler {
    public constructor(
        @Inject(EVENT_BUS)
        private eventBus: EventBus
    ) {
        this.eventBus.subscribe(AccountCreatedEvent, this.handle.bind(this));
    }
    
    private handle(event: Event): void {
        console.error('Received event', event);
    }
}
