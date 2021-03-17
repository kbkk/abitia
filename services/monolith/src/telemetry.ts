import { context } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();

const provider = new NodeTracerProvider();

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({ contextManager });

context.setGlobalContextManager(contextManager);

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
