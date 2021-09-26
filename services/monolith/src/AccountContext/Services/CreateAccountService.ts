import { inject, injectable } from 'inversify';

import * as E from '../../Core/Fp/Either';
import { LOGGER, Logger } from '../../Core/Logger';
import { OUTBOX, Outbox } from '../../Core/Outbox';
import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { Account, AccountWithThisEmailAlreadyExistsError, newAccountId } from '../Entities/Account';
import { AccountCreatedEvent } from '../Events/AccountCreatedEvent';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';


export type CreateAccountResult = E.Either<{
    message: string;
}, {
    id: string;
    email: string;
}>

@injectable()
export class CreateAccountService {
    public constructor(
        @inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @inject(OUTBOX)
        private readonly outbox: Outbox,
        @inject(LOGGER)
        private readonly logger: Logger,
    ) {
    }

    public async execute(dto: CreateAccountDto): Promise<CreateAccountResult> {
        const account = await Account.create(newAccountId(), dto.email, dto.password);

        const event = new AccountCreatedEvent(account.id);
        await this.outbox.send(event);

        // todo: careful, account save must be after outbox send
        // move em.flush away from repository to fix this
        const saveResult = await this.accountRepository.save(account);

        return E.match(
            saveResult,
            (error) => {
                if (error instanceof AccountWithThisEmailAlreadyExistsError) {
                    return E.left({
                        message: 'Account with this email address already exists',
                    });
                }

                return E.left({ message: 'Unknown error' });
            },
            () => {
                this.logger.info(`Created account ${account.id}`);

                return E.right({
                    id: account.id,
                    email: account.email,
                });
            },
        );
    }
}
