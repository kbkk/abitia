import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { context, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';


// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);

const contextManager = new AsyncHooksContextManager();
contextManager.enable();

// provider.addSpanProcessor(
//     new BatchSpanProcessor(
//         new ZipkinExporter({
//             serviceName: 'monolith',
//             url: 'http://localhost:9411/api/v2/spans',
//         }),
//     ),
// );

const provider = new NodeTracerProvider();

const gcpExporter = new TraceExporter({
    keyFile: './service_account_key.json',
});

provider.addSpanProcessor(new BatchSpanProcessor(gcpExporter));

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
