import { EntityManager } from '@mikro-orm/core';

import { Event, EventBus } from '../../EventBus';

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
    private eventBus: EventBus;
    private running = false;
    private processingPromise?: Promise<unknown>;

    public constructor(
        globalEm: EntityManager,
    ) {
        this.em = globalEm.fork();
    }

    public async start(eventBus: EventBus): Promise<void> {
        this.eventBus = eventBus;
        this.running = true;

        // eslint-disable-next-line no-constant-condition
        while(this.running) {
            this.processingPromise = this.processMessages();
            await this.processingPromise;

            // Check again, no point in wasting time when stopped
            if(this.running) {
                await sleep(250);
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
