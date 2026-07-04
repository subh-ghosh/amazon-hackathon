export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_STORE_TABLE ?? "CircularOS-CustomerSessions";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const SESSION_COOKIE = "slc_session_id";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

type AppState = {
  cart: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  customer_id: string;
  persona: "TRUSTED" | "SUSPICIOUS";
  greenCredits: number;
  greenHistory: Array<{ action: string; credits: number; timestamp: string }>;
};

function defaultState(): AppState {
  return {
    cart: [],
    orders: [],
    customer_id: "CUST-GOOD-001",
    persona: "TRUSTED",
    greenCredits: 150,
    greenHistory: [
      { action: "Welcome bonus", credits: 100, timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
      { action: "Chose sustainable packaging", credits: 10, timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { action: "Bought Renewed item", credits: 50, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { action: "Redeemed: ₹500 off order", credits: -10, timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
  };
}

async function loadState(sessionId: string): Promise<AppState | null> {
  const response = await client.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { sessionId },
  }));
  return (response.Item?.state as AppState | undefined) ?? null;
}

async function saveState(sessionId: string, state: AppState) {
  await client.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      sessionId,
      state,
      updatedAt: new Date().toISOString(),
    },
  }));
}

function getSessionId(request: NextRequest): string {
  return request.cookies.get(SESSION_COOKIE)?.value ?? randomUUID();
}

export async function GET(request: NextRequest) {
  const sessionId = getSessionId(request);
  const existing = await loadState(sessionId);
  const state = existing ?? defaultState();

  if (!existing) {
    await saveState(sessionId, state);
  }

  const response = NextResponse.json(state);
  response.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}

export async function PUT(request: NextRequest) {
  const sessionId = getSessionId(request);
  const state = (await request.json()) as AppState;
  await saveState(sessionId, state);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
