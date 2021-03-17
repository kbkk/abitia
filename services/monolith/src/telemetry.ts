import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';

const provider = new NodeTracerProvider({
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register();

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
