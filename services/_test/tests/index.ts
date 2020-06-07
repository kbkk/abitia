import fetch from 'node-fetch';
import {expect} from 'chai';

import {createServer} from '../src';

describe('integration tests', () => {
    it('should return 200 on /', async () => {
        const server = createServer();
        await server.listen(3000);

        const response = await fetch('http://localhost:3000/');

        expect(response.status).to.eql(200);
        expect(await response.json()).to.eql({message: 'Hello!'});

        await server.close();
    });
});
