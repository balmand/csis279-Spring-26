const BASE_URL = process.env.BASE_URL;

export const api = async (endpoint, options = {}) => {
    const res = await fetch(
        `${BASE_URL}${endpoint}`,{
        ...options
    },
);
    const data = await res.json();
    //if(!res.ok) throw new Error("Api Error");
    return data;
}