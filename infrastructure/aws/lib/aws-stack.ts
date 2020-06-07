import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';

// todo: Research custom resource names via https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.Stack.html#protected-allocate-wbr-logical-wbr-idcfnelement
// maybe we can get rid of the "abitia-" prefix and make the generated resource names more readable

export class AwsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'abitia-vpc', {maxAzs: 1});

        // todo: expose services directly, the traffic should be going through a load balancer instead
        const serviceSecurityGroup = new ec2.SecurityGroup(this, 'abitia-service-security-group', {
            vpc,
            allowAllOutbound: true,
            description: "Allow HTTP/HTTPS access to fargate tasks."
        });

        serviceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
        serviceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

        const cluster = new ecs.Cluster(this, 'abitia-cluster', {vpc});

        const taskDefinition = new ecs.FargateTaskDefinition(
            this,
            "abitia-test-service-task-definition",
            {
                family: 'abitia-test-service-task-definition'
            }
        );

        const container = taskDefinition.addContainer(
            "service",
            {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")
            }
        );

        container.addPortMappings({containerPort: 80});

        const service = new ecs.FargateService(
            this,
            "abitia-fargate-service",
            {
                cluster,
                taskDefinition,
                assignPublicIp: true,
                securityGroups: [serviceSecurityGroup]
            }
        );
    }
}
