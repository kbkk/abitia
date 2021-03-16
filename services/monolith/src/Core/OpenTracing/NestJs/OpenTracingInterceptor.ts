import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { tracingStorage } from '../tracingStorage';

@Injectable()
export class OpenTracingInterceptor implements NestInterceptor {
    public intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const traceId = uuid();

        let promise;
        tracingStorage.run({ traceId }, () => {
            promise = next
                .handle()
                .toPromise();
        });

        return promise;
    }
}
