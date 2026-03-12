const BASE = import.meta.env.VITE_API_URL+"/auth";

export const login = async ({ client_email, password }) => {
    const url = `${BASE}/login`;
    console.log(url);
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_email, password }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
};

export const register = async ({ client_name, client_email, client_dob, password, role }) => {
    const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name, client_email, client_dob, password, role }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
};
