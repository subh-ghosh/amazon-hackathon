#!/usr/bin/env python3
import os
import aws_cdk as cdk
from stacks.main_stack import HackathonStack

app = cdk.App()
HackathonStack(app, "CircularIntelligenceOS-GraphService",
    env=cdk.Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region=os.getenv('CDK_DEFAULT_REGION')
    )
)
app.synth()
