#!/usr/bin/env python3
import os

import aws_cdk as cdk

from infra.infra_stack import SellerServiceStack


app = cdk.App()
SellerServiceStack(app, "CircularIntelligenceOS-SellerService",
    env=cdk.Environment(account=os.environ.get("CDK_DEFAULT_ACCOUNT"), region="us-east-1")
)

app.synth()
