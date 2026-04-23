const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
const GRAPHQL_URL = (import.meta.env.VITE_GRAPHQL_URL || `${API_BASE_URL}/graphql`).replace(/\/+$/, "");

const buildError = (payload, fallback = "Request failed.") => {
    const firstError = payload?.errors?.[0];

    if (firstError) {
        return {
            message: firstError.message || fallback,
            code: firstError.extensions?.code || "GRAPHQL_ERROR",
        };
    }

    return {
        message: payload?.message || fallback,
        code: payload?.code || "REQUEST_ERROR",
    };
};

export const requestGraphql = async (document, options = {}) => {
    const { variables, includeMeta = false, dataPath } = options;
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: document,
            variables,
        }),
    });

    const payload = await response.json().catch(() => ({}));
    const hasErrors = !response.ok || Array.isArray(payload?.errors) && payload.errors.length > 0;

    if (hasErrors) {
        const error = buildError(payload);

        if (includeMeta) {
            return {
                ok: false,
                status: response.status,
                data: error,
            };
        }

        return error;
    }

    const data = dataPath ? payload?.data?.[dataPath] : payload?.data;

    if (includeMeta) {
        return {
            ok: true,
            status: response.status,
            data,
        };
    }

    return data;
};
