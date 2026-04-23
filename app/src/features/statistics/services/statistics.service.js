import { requestGraphql } from "../../../services/api";

export const getSalesDashboard = (filters = {}, clientId) => {
    return requestGraphql(
        `query GetSalesDashboard($clientId: Int!, $filters: SalesDashboardFiltersInput) {
            salesDashboard(clientId: $clientId, filters: $filters)
        }`,
        {
            variables: {
                clientId: Number(clientId),
                filters,
            },
            includeMeta: true,
            dataPath: "salesDashboard",
        }
    ).then((response) => {
        if (!response.ok) {
            return response;
        }

        try {
            return {
                ...response,
                data: response.data ? JSON.parse(response.data) : null,
            };
        } catch {
            return {
                ok: false,
                status: response.status,
                data: { message: "Failed to parse sales dashboard response." },
            };
        }
    });
};
