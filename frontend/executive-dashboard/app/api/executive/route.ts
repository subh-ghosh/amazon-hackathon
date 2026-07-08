export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { ExecutiveDashboardData } from "@/types/executive-impact";

const TABLE_NAME = process.env.DYNAMODB_EXECUTIVE_TABLE ?? "CircularOS-ExecutiveSnapshots";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

export async function GET() {
  const response = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { snapshotId: "default" },
    }),
  );

  const data = (response.Item?.data as ExecutiveDashboardData | undefined) ?? null;

  if (!data) {
    return NextResponse.json({ error: "Executive snapshot unavailable." }, { status: 404 });
  }

  return NextResponse.json(data);
}
