import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { MikroOrmOutboxWorker } from '../../Core/Outbox/MikroOrm/MikroOrmOutboxWorker';

@Injectable()
export class RegisterOutboxWorker implements OnApplicationBootstrap {
    public constructor(
        private readonly worker: MikroOrmOutboxWorker,
    ) {}

    public onApplicationBootstrap(): void {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.worker.start();
    }
}
