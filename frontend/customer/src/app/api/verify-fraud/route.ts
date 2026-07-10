import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
        }

        // The Cloudflare Turnstile Secret Key (Generated via API)
        const secret = "0x4AAAAAADzWC6-LD8tTmnBgTsT0aB8fNOQ";

        const formData = new URLSearchParams();
        formData.append('secret', secret);
        formData.append('response', token);

        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = await res.json();

        if (data.success) {
            return NextResponse.json({ success: true, message: 'Fraud verification passed' });
        } else {
            return NextResponse.json({ success: false, error: 'Bot or suspicious activity detected' }, { status: 403 });
        }
    } catch (error) {
        console.error('Error verifying Turnstile token:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
