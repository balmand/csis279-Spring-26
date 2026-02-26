const BASE = "http://localhost:3001/clients";

export const getClients = async () => {
    const res = await fetch(`${BASE}`);
    const data = await res.json();
    return data;
}

export const getClient = async(id) =>{
    const res = await fetch(`${BASE}/${id}`);
    console.log(res);
    const data = await res.json;
    return data;
}

export const saveClient = async(data, id) => {
    fetch(id ? `${BASE}/${id}` : BASE, {
        method: id ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })
}

export const deleteUser = (id) =>{
    fetch(`${BASE}/${id}`, {method: "DELETE"});
}