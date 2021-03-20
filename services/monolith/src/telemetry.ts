import { context, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();

const provider = new NodeTracerProvider();

provider.addSpanProcessor(
    new BatchSpanProcessor(
        new ZipkinExporter({
            serviceName: 'monolith',
            url: 'http://localhost:9411/api/v2/spans',
        }),
    ),
);

provider.register({ contextManager });

context.setGlobalContextManager(contextManager);

trace.setGlobalTracerProvider(provider);

registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
        {
            plugins: {
                express: {
                    enabled: true,
                    path: '@opentelemetry/plugin-express',
                },
            },
        },
    ],
});

console.log('OpenTelemetry initialized');

export {
    provider,
};
