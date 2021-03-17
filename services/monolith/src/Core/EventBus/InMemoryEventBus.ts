import { context, SpanKind, SpanStatusCode } from '@opentelemetry/api';

import { Logger } from '../Logger';
import { tracer } from '../OpenTracing';

import { Event } from './Event';
import { EventBus, EventBusSubscriber } from './EventBus';

export class InMemoryEventBus implements EventBus {
    private subscribers: Record<string, EventBusSubscriber<unknown>[]> = {};

    public constructor(
        private readonly logger?: Logger,
    ) {
    }

    public publish(event: Event): void {
        // Run subscribers in a fire&forget manner
        this
            ._runPublish(event)
            .catch(error => this.logger?.error('Failed to run subscribers', error));
    }

    private async _runPublish(event: Event): Promise<void> {
        const eventSubscribers = this.subscribers[event.constructor.name] ?? [];

        for(const subscriber of eventSubscribers) {
            const span = tracer.startSpan('event-handler', {
                kind: SpanKind.CONSUMER,
            }, context.active());
            span.setAttribute('event.name', event.name);
            try {
                await subscriber(event);
                span.setStatus({ code: SpanStatusCode.OK });
            } catch (error) {
                this.logger?.error(`Failed to run subscriber for event ${event.name}`, error);
                span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message });
            } finally {
                span.end();
            }
        }
    }

    public subscribe<T extends typeof Event>(event: T, subscriber: EventBusSubscriber<T>): void {
        if(!this.subscribers[event.name]) {
            this.subscribers[event.name] = [];
        }

        this.subscribers[event.name].push(subscriber);
    }
}
