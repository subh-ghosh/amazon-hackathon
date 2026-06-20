import { NextRequest, NextResponse } from "next/server";

const SERVICE_URLS: Record<string, string> = {
    s1: "http://Circul-Preve-LR6DbKamKWdv-928899529.us-east-1.elb.amazonaws.com",
    s2: "http://Circul-Truth-h1F0FkRvcVsk-801111338.us-east-1.elb.amazonaws.com",
    s3: "http://Circul-Fraud-XcBUDzI1MwrU-1950216713.us-east-1.elb.amazonaws.com",
    s4: "http://Circul-Digit-1KUgWt1Obxuk-628222820.us-east-1.elb.amazonaws.com",
    s5: "http://Circul-Simul-4WKIzeeG23Pg-1522722278.us-east-1.elb.amazonaws.com",
    s6: "http://Circul-Optim-VznHSwftfNgj-1405514615.us-east-1.elb.amazonaws.com",
    s7: "http://Circul-Logis-tlTDwNs1Omzx-39457157.us-east-1.elb.amazonaws.com",
    s8: "http://Circul-Retur-3aJGuOitxrQQ-1157813753.us-east-1.elb.amazonaws.com",
    s9: "http://Circul-Circu-jsU6YMlH3H2K-853712911.us-east-1.elb.amazonaws.com",
    s10: "http://Circul-Packa-ZPto7mjaCRIO-560627207.us-east-1.elb.amazonaws.com",
    s11: "http://Circul-Selle-VYLlrHB2ylcJ-1969622883.us-east-1.elb.amazonaws.com",
    s12: "http://Circul-Graph-IIxBpeJf0S3j-1441021229.us-east-1.elb.amazonaws.com",
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
