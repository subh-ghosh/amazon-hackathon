import { NextRequest, NextResponse } from "next/server";

const SERVICE_URLS: Record<string, string> = {
    s1: "http://Circul-Preve-Rs6gi1hesUgp-476733633.us-east-1.elb.amazonaws.com",
    s2: "http://Circul-Truth-HR7ES9usthBv-33182633.us-east-1.elb.amazonaws.com",
    s3: "http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com",
    s4: "http://Circul-Digit-XXDMcCWoqhd0-1019952249.us-east-1.elb.amazonaws.com",
    s5: "http://Circul-Simul-a4nmYbuxVUrr-319139381.us-east-1.elb.amazonaws.com",
    s6: "http://Circul-Optim-mcZ0NzPDZK07-890558390.us-east-1.elb.amazonaws.com",
    s7: "http://Circul-Logis-hgIeVqBbAk0h-362510022.us-east-1.elb.amazonaws.com",
    s8: "http://Circul-Retur-AkanfcKdPytd-593568738.us-east-1.elb.amazonaws.com",
    s9: "http://Circul-Circu-sybvn5Ar6ipQ-119322148.us-east-1.elb.amazonaws.com",
    s10: "http://Circul-Packa-AN1B5mVKsku9-408281128.us-east-1.elb.amazonaws.com",
    s11: "http://Circul-Selle-Q7zRyEczbzCg-2088084796.us-east-1.elb.amazonaws.com",
    s12: "http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com",
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ service: string; path?: string[] }> }
) {
    const { service, path } = await params;
    return proxyRequest(request, service, path, "GET");
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ service: string; path?: string[] }> }
) {
    const { service, path } = await params;
    return proxyRequest(request, service, path, "POST");
}

async function proxyRequest(
    request: NextRequest,
    service: string,
    path: string[] | undefined,
    method: string
) {
    const baseUrl = SERVICE_URLS[service.toLowerCase()];
    if (!baseUrl) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const targetPath = path ? "/" + path.join("/") : "";
    const targetUrl = baseUrl + targetPath;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    let body: string | undefined;
    if (method === "POST") {
        try {
            body = JSON.stringify(await request.json());
        } catch {
            body = undefined;
        }
    }

    try {
        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
        });

        const data = await response.json().catch(() => null);
        return NextResponse.json(data || {}, { status: response.status });
    } catch (err) {
        console.error(`[Proxy] ${method} ${targetUrl} failed:`, err);
        return NextResponse.json(
            { error: "Service unavailable", target: targetUrl },
            { status: 503 }
        );
    }
}
