export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";

const SERVICE_URLS: Record<string, string> = {
    s1: "https://tvdo7qmc8h.execute-api.us-east-1.amazonaws.com",
    s2: "https://x3pm62ptqi.execute-api.us-east-1.amazonaws.com",
    s3: "https://86oljvteu5.execute-api.us-east-1.amazonaws.com",
    s4: "https://y7eefpwok6.execute-api.us-east-1.amazonaws.com",
    s5: "https://cupc0rhwo0.execute-api.us-east-1.amazonaws.com",
    s6: "https://72247dj8k5.execute-api.us-east-1.amazonaws.com",
    s7: "https://7dlvxxfg00.execute-api.us-east-1.amazonaws.com",
    s8: "https://jsimnqww4h.execute-api.us-east-1.amazonaws.com",
    s9: "https://0r29iejkgj.execute-api.us-east-1.amazonaws.com",
    s10: "https://2bzxe922eg.execute-api.us-east-1.amazonaws.com",
    s11: "https://oyxnydwp28.execute-api.us-east-1.amazonaws.com",
    s12: "https://mbdbx9jqs7.execute-api.us-east-1.amazonaws.com",
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
        return NextResponse.json({ error: "Unknown service" }, { status: 404 });
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
        console.error(`Proxy error for ${targetUrl}:`, err);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
}
