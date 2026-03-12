import { api } from "../../../services/api";

export const login = ({ client_email, password }) => {
    return api("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_email, password }),
        includeMeta: true,
    });
};

export const register = ({ client_name, client_email, client_dob, password, role }) => {
    return api("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name, client_email, client_dob, password, role }),
        includeMeta: true,
    });
};
