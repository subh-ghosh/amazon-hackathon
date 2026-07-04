export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { Product } from "@/api/types";

const TABLE_NAME = process.env.DYNAMODB_CATALOG_TABLE ?? "CircularOS-ProductCatalog";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const response = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { product_id: id },
    }),
  );

  const product = (response.Item as Product | undefined) ?? null;

  if (!product) {
    return NextResponse.json({ error: `Product ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json(product);
}
