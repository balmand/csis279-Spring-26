const BASE = "http://localhost:3001/auth";

export const login = async ({ client_email, password }) => {
    const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_email, password }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
};

export const register = async ({ client_name, client_email, client_dob, password }) => {
    const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name, client_email, client_dob, password }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
};
