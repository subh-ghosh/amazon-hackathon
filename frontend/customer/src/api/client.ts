/**
 * API client — all requests go through /api/proxy/[service] which
 * forwards to the actual AWS ALB. No CORS issues.
 */

export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public body?: unknown
    ) {
        super(`API Error: ${status} ${statusText}`);
        this.name = "ApiError";
    }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new ApiError(response.status, response.statusText, data);
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(0, (error as Error).message || "Network Error");
    }
}

export const apiClient = {
    get: <T>(url: string) => request<T>(url, { method: "GET" }),
    post: <T>(url: string, body: unknown) =>
        request<T>(url, { method: "POST", body: JSON.stringify(body) }),
};
