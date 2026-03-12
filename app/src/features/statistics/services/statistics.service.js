import { api } from "../../../services/api";

const buildQueryString = (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    return params.toString();
};

export const getSalesDashboard = (filters = {}, clientId) => {
    const queryString = buildQueryString(filters);
    const endpoint = `/statistics/sales/dashboard${queryString ? `?${queryString}` : ''}`;

    return api(endpoint, {
        headers: {
            'x-client-id': clientId,
        },
        includeMeta: true,
    });
};
