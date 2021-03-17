import { getSpanContext, SpanContext, context } from '@opentelemetry/api';

export const getActiveSpan = (): SpanContext | undefined =>
    getSpanContext(context.active());
