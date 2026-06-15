#!/usr/bin/env python3
import os
import aws_cdk as cdk
from stacks.main_stack import SimulatorStack

app = cdk.App()
SimulatorStack(app, "CircularIntelligenceOS-SimulatorService",
    env=cdk.Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region=os.getenv('CDK_DEFAULT_REGION')
    )
)
app.synth()
