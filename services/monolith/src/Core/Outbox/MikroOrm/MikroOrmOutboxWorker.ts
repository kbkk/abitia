import { EntityManager } from '@mikro-orm/core';

import { Event, EventBus } from '../../EventBus';
import { Logger } from '../../Logger';

import { OutboxMessageEntity } from './OutboxMessageEntity';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const adaptMessageToEvent = (message: OutboxMessageEntity): Event => {
    const payload = JSON.parse(message.eventPayload);

    Object.defineProperty(payload, 'constructor', {
        value: {
            name: message.eventName,
        },
        enumerable: false,
        writable: false,
    });

    return payload;
};

export class MikroOrmOutboxWorker {
    private readonly em: EntityManager;
    private running = false;
    private processingPromise?: Promise<unknown>;

    public constructor(
        globalEm: EntityManager,
        private readonly eventBus: EventBus,
        private readonly logger?: Logger,
        private readonly options = {
            fetchDelay: 250,
        },
    ) {
        this.em = globalEm.fork();
    }

    public async start(): Promise<void> {
        this.running = true;

        // eslint-disable-next-line no-constant-condition
        while(this.running) {
            try {
                this.processingPromise = this.processMessages();
                await this.processingPromise;
            } catch (error) {
                this.logger?.error('Failed to process outbox messages', { error });
            }

            // Check again, no point in wasting time when stopped
            if(this.running) {
                await sleep(this.options.fetchDelay);
            }
        }
    }

    public async stop(): Promise<void> {
        this.running = false;
        await this.processingPromise;
    }

    private async processMessages(): Promise<void> {
        const messages = await this.em.find(OutboxMessageEntity, {
            processedAt: null,
        });

        for(const message of messages) {
            const event = adaptMessageToEvent(message);

            this.eventBus.publish(event);

            message.markAsProcessed();
            await this.em.persistAndFlush(message);
        }
    }
}
