import { getSpanContext, SpanContext, context, trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('monolith');

export const getActiveSpan = (): SpanContext | undefined =>
    getSpanContext(context.active());
