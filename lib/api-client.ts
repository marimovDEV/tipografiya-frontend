// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Token ${token}`);
    }
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = url.startsWith('/api/') && baseUrl ? `${baseUrl}${url}` : url;
    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Handle logout or redirect - but avoid infinite loop
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Only redirect if not already redirecting and not already on login page
        if (typeof window !== 'undefined' &&
            !isRedirecting &&
            !window.location.pathname.includes('/auth/login')) {
            isRedirecting = true;
            window.location.href = "/auth/login";
            // Reset flag after a delay (in case redirect fails)
            setTimeout(() => { isRedirecting = false; }, 1000);
        }
    }

    return response;
}

export async function fetchDielinePreview(params: any) {
    const searchParams = new URLSearchParams(params);
    const response = await fetchWithAuth(`/api/dieline/preview/?${searchParams.toString()}`, {
        method: "GET",
    });
    return response;
}

export async function fetchNestingOptimization(params: any) {
    const searchParams = new URLSearchParams(params);
    const response = await fetchWithAuth(`/api/optimization/nesting/?${searchParams.toString()}`, {
        method: "GET",
    });
    return response;
}

export async function fetchPricingCalculation(params: any) {
    const response = await fetchWithAuth("/api/pricing/calculate/", {
        method: "POST",
        body: JSON.stringify(params),
    });
    return response;
}
