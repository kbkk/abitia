import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Aws from '../lib/aws-stack';

test.skip('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Aws.AwsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
