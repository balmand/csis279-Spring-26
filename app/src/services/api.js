const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

const parseResponse = async (res) => {
    const text = await res.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

export const api = async (endpoint, options = {}) => {
    const { includeMeta = false, ...requestOptions } = options;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...requestOptions,
    });
    const data = await parseResponse(res);

    if (includeMeta) {
        return {
            ok: res.ok,
            status: res.status,
            data,
        };
    }

    return data;
};
