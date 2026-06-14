import { NextRequest, NextResponse } from "next/server";

const REQUEST_TIMEOUT_MS = 30000;

const SERVICES = {
  s3: {
    label: "S3",
    name: "Service #3 Fraud & Trust Engine",
    baseUrl:
      process.env.SERVICE3_API_BASE ??
      process.env.NEXT_PUBLIC_SERVICE3_API_BASE ??
      "http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com",
    path: "/api/v1/fraud/score",
  },
  s5: {
    label: "S5",
    name: "Service #5 Future Simulator",
    baseUrl:
      process.env.SERVICE5_API_BASE ??
      process.env.NEXT_PUBLIC_SERVICE5_API_BASE ??
      "http://Circul-Simul-a4nmYbuxVUrr-319139381.us-east-1.elb.amazonaws.com",
    path: "/api/v1/simulation/run",
  },
  s6: {
    label: "S6",
    name: "Service #6 Recovery Optimizer",
    baseUrl:
      process.env.SERVICE6_API_BASE ??
      process.env.NEXT_PUBLIC_SERVICE6_API_BASE ??
      "http://Circul-Optim-mcZ0NzPDZK07-890558390.us-east-1.elb.amazonaws.com",
    path: "/api/v1/recovery/optimize",
  },
  s7: {
    label: "S7",
    name: "Service #7 Reverse Logistics",
    baseUrl:
      process.env.SERVICE7_API_BASE ??
      process.env.NEXT_PUBLIC_SERVICE7_API_BASE ??
      "http://Circul-Logis-hgIeVqBbAk0h-362510022.us-east-1.elb.amazonaws.com",
    path: "/api/v1/logistics/optimize",
  },
  s2: {
    label: "S2",
    name: "Service #2 Truth Discovery",
    baseUrl:
      process.env.SERVICE2_API_BASE ??
      process.env.NEXT_PUBLIC_SERVICE2_API_BASE ??
      "",
    path: process.env.SERVICE2_TRUTH_DISCOVERY_PATH ?? "/api/v1/truth/discover",
  },
} as const;

type ServiceKey = keyof typeof SERVICES;

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> },
) {
  const { service } = await params;
  const config = SERVICES[service as ServiceKey];

  if (!config) {
    return NextResponse.json(
      { message: `Unknown recovery workflow service: ${service}` },
      { status: 404 },
    );
  }

  if (!config.baseUrl) {
    return NextResponse.json(
      {
        message: `${config.name} is not configured. Set SERVICE2_API_BASE when the deployed endpoint is available.`,
      },
      { status: 503 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const url = `${config.baseUrl}${config.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  console.log(`${config.label} request`, payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await parseResponseBody(response);

    console.log(`${config.label} response`, {
      status: response.status,
      body,
    });

    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? `${config.name} timed out after ${REQUEST_TIMEOUT_MS}ms.`
        : `${config.name} network error while calling ${url}: ${
            error instanceof Error ? error.message : String(error)
          }`;

    console.error(`${config.label} response`, { status: 502, message });

    return NextResponse.json({ message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
