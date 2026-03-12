import {api} from "../../../services/api";

export const getDepartments = () => {
    return api("/departments");
}

export const getDepartment = (id) =>{
   return api(`/departments/${id}`);
}

export const saveDepartment = (data, id) =>{

    api(id ? `/departments/${id}` : `/departments`, {
        method: id ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
}

export const deleteDepartment = (id) => {
    api(`/departments/${id}`, {
        method: "DELETE",
    });
}