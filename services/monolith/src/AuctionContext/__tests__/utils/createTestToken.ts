import { createTestTokenFactory } from '../../../Core/Auth/Testing/createTestTokenFactory';

import { createTestConfig } from './createTestConfig';

const testConfig = createTestConfig();

export const createTestToken = createTestTokenFactory(testConfig.jwtSecretKey);
