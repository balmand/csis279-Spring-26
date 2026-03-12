const BASE = 'http://localhost:3001';

const buildQueryString = (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    return params.toString();
};

export const getSalesDashboard = async (filters = {}, clientId) => {
    const queryString = buildQueryString(filters);
    const endpoint = `${BASE}/statistics/sales/dashboard${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(endpoint, {
        headers: {
            'x-client-id': clientId,
        },
    });
    const data = await res.json();

    return {
        ok: res.ok,
        status: res.status,
        data,
    };
};
