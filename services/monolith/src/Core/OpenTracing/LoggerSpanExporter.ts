import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';

import { Logger } from '../Logger';

const CODE_OK = 1;

export class LoggerSpanExporter implements SpanExporter {
    public constructor(private readonly logger: Logger) {}

    public export(spans: ReadableSpan[], resultCallback: (result) => void): void {
        for (const span of spans) {
            this.logger.info(span.name, this.exportInfo(span));
        }

        resultCallback({ code: CODE_OK });
    }

    public shutdown(): Promise<void> {
        return Promise.resolve();
    }

    private exportInfo(span): Record<string, unknown> {
        return {
            traceId: span.spanContext.traceId,
            parentId: span.parentSpanId,
            name: span.name,
            id: span.spanContext.spanId,
            kind: span.kind,
            timestamp: this.hrTimeToMicroseconds(span.startTime),
            duration: this.hrTimeToMicroseconds(span.duration),
            attributes: span.attributes,
            status: span.status,
            events: span.events,
        };
    }

    private hrTimeToMicroseconds(hrTime): number {
        return Math.round(hrTime[0] * 1e6 + hrTime[1] / 1e3);
    }
}
