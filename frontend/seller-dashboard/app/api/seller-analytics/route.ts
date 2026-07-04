export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { SellerAnalytics } from "@/types/seller-analytics";

const TABLE_NAME = process.env.DYNAMODB_SELLER_ANALYTICS_TABLE ?? "CircularOS-SellerAnalytics";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const SELLER_ID = process.env.SELLER_ANALYTICS_ID ?? "SELLER-NORTHSTAR-01";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

export async function GET() {
  const response = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { sellerId: SELLER_ID },
    }),
  );

  const data = (response.Item?.data as SellerAnalytics | undefined) ?? null;

  if (!data) {
    return NextResponse.json({ error: "Seller analytics snapshot unavailable." }, { status: 404 });
  }

  return NextResponse.json(data);
}
