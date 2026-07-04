export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Product } from "@/api/types";

const TABLE_NAME = process.env.DYNAMODB_CATALOG_TABLE ?? "CircularOS-ProductCatalog";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

export async function GET() {
  const response = await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    }),
  );

  const products = ((response.Items ?? []) as Product[]).sort((left, right) =>
    left.title.localeCompare(right.title),
  );
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();

  return NextResponse.json({ products, categories });
}
