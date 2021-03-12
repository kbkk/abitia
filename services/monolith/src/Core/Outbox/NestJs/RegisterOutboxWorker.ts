import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

import { MikroOrmOutboxWorker } from '../MikroOrm';

@Injectable()
export class RegisterOutboxWorker implements OnApplicationBootstrap, OnApplicationShutdown {
    public constructor(
        private readonly worker: MikroOrmOutboxWorker,
    ) {}

    public onApplicationBootstrap(): void {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.worker.start();
    }

    public async onApplicationShutdown(signal?: string): Promise<void> {
        await this.worker.stop();
    }
}
