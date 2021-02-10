import { Module } from '@nestjs/common';

import { AppController } from './AppController';

@Module({
    imports: [],
    controllers: [AppController],
})
export class AppModule {}
