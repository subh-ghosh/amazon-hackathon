export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { OperationsData } from "@/types/operations";

const TABLE_NAME = process.env.DYNAMODB_OPERATIONS_TABLE ?? "CircularOS-OperationsSnapshots";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

export async function GET() {
  const response = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { snapshotId: "default" },
    }),
  );

  const data = (response.Item?.data as OperationsData | undefined) ?? null;

  if (!data) {
    return NextResponse.json({ error: "Operations snapshot unavailable." }, { status: 404 });
  }

  return NextResponse.json(data);
}
