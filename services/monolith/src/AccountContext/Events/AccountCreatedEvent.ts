import { Event } from '../../Core/EventBus';
import { AccountId } from '../Entities/Account';

export class AccountCreatedEvent extends Event {
    public constructor(
        public readonly accountId: AccountId,
    ) {
        super();
    }
}
