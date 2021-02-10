import { NestFactory } from '@nestjs/core';

import { AppModule } from './AppModule';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
})();
