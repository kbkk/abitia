import { getSpanContext, SpanContext } from '@opentelemetry/api';

import { contextManager } from '../../telemetry';

export const getActiveSpan = (): SpanContext | undefined =>
    getSpanContext(contextManager.active());
