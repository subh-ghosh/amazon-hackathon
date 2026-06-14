#!/usr/bin/env python3
import os
import aws_cdk as cdk
from stacks.main_stack import DigitalTwinStack

app = cdk.App()
DigitalTwinStack(app, "CircularIntelligenceOS-DigitalTwinService",
    env=cdk.Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region=os.getenv('CDK_DEFAULT_REGION')
    )
)
app.synth()
