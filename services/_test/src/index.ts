import {once} from "events";

import {NestFactory} from '@nestjs/core';
import {ExpressAdapter} from "@nestjs/platform-express";

import {AccountContextModule} from "./AccountContext/AccountContextModule";
import {AuctionContextModule} from "./AuctionContext/AuctionContextModule";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function bootstrap() {
    const factoryOptions = {abortOnError: true};
    const express = new ExpressAdapter();

    const accountContext = await NestFactory.create(AccountContextModule, express, factoryOptions);
    accountContext.setGlobalPrefix('/AccountContext');

    const auctionContext = await NestFactory.create(AuctionContextModule, express, factoryOptions);
    auctionContext.setGlobalPrefix('/AuctionContext');

    // Todo: this may break.
    // Initializing a single nest module registers a 404 handler and modules registered after that one
    // will not register they controllers correctly https://github.com/nestjs/nest/issues/4269
    await Promise.all([
        accountContext.init(),
        auctionContext.init(),
    ]);

    const server = express.listen(3000);
    await once(server, 'listening');
    
    console.log('Nest.js app server started');
})();
