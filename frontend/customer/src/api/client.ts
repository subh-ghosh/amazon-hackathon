/**
 * Centralized API client with error handling, loading states, and typed responses.
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

interface RequestOptions {
    timeout?: number;
    headers?: Record<string, string>;
}

async function request<T>(
    url: string,
    options: RequestInit & RequestOptions = {}
): Promise<T> {
    const { timeout = 10000, headers: extraHeaders, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...extraHeaders,
            },
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new ApiError(response.status, response.statusText, body);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if ((error as Error).name === "AbortError") {
            throw new ApiError(408, "Request Timeout");
        }
        throw new ApiError(0, (error as Error).message || "Network Error");
    } finally {
        clearTimeout(timeoutId);
    }
}

export const apiClient = {
    get: <T>(url: string, options?: RequestOptions) =>
        request<T>(url, { method: "GET", ...options }),

    post: <T>(url: string, body: unknown, options?: RequestOptions) =>
        request<T>(url, {
            method: "POST",
            body: JSON.stringify(body),
            ...options,
        }),
};
