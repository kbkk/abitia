import { AwsXRayIdGenerator } from '@aws/otel-aws-xray-id-generator';
import { AWSXRayPropagator } from '@aws/otel-aws-xray-propagator';
import { context, diag, DiagConsoleLogger, DiagLogLevel, propagation, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector-grpc';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);

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

propagation.setGlobalPropagator(new AWSXRayPropagator());
// create a provider for activating and tracking with AWS IdGenerator
const tracerConfig = {
    idGenerator: new AwsXRayIdGenerator(),
};
const provider = new NodeTracerProvider(tracerConfig);
// add OTLP exporter
const otlpExporter = new CollectorTraceExporter({
    serviceName: 'monolith',
    // port configured in the Collector config, defaults to 55680
    url: 'localhost:4317',
});
provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));

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
