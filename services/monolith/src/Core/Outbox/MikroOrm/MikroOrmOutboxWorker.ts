import { EntityManager } from '@mikro-orm/core';
import { context, ROOT_CONTEXT, setSpanContext, SpanKind } from '@opentelemetry/api';

import { Event, EventBus } from '../../EventBus';
import { Logger } from '../../Logger';
import { tracer } from '../../OpenTracing';

import { OutboxMessageEntity } from './OutboxMessageEntity';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adaptMessageToEvent = (eventName: string, event: any): Event => {
    Object.defineProperty(event, 'name', {
        value: eventName,
        enumerable: false,
        writable: false,
    });

    Object.defineProperty(event, 'constructor', {
        value: {
            name: eventName,
        },
        enumerable: false,
        writable: false,
    });

    return event;
};

type MikroOrmOutboxWorkerOptions = {
    fetchDelay: number;
    debug: boolean;
}

export class MikroOrmOutboxWorker {
    private readonly em: EntityManager;
    private readonly options: MikroOrmOutboxWorkerOptions
    private running = false;
    private processingPromise?: Promise<unknown>;

    public constructor(
        globalEm: EntityManager,
        private readonly eventBus: EventBus,
        private readonly logger?: Logger,
        options: Partial<MikroOrmOutboxWorkerOptions> = {},
    ) {
        this.options = Object.assign({
            fetchDelay: 250,
            debug: false,
        }, options);

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
                /* istanbul ignore next */
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
        this.em.clear();
        const messages = await this.em.find(OutboxMessageEntity, {
            processedAt: null,
        }, { limit: 5 });

        /* istanbul ignore if  */
        if(this.options.debug && messages.length) {
            this.logger?.debug(`Processing ${messages.length} outbox messages`);
        }

        for(const message of messages) {
            const payload = JSON.parse(message.eventPayload);
            const rootCtx = setSpanContext(ROOT_CONTEXT, payload.tracingContext);

            await context.with(rootCtx, async () => {
                const span = tracer.startSpan('outbox-worker', {
                    kind: SpanKind.CONSUMER,
                });

                const event = adaptMessageToEvent(message.eventName, payload.event);

                span.setAttribute('event.name', event.name);

                this.eventBus.publish(event);

                message.markAsProcessed();
                await this.em.persistAndFlush(message);

                span.end();
            });
        }
    }
}
