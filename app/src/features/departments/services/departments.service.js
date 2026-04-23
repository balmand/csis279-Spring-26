import { requestGraphql } from "../../../services/api";

const DEPARTMENT_FIELDS = `
  dep_id
  dep_name
`;

export const getDepartments = () => {
    return requestGraphql(
        `query GetDepartments {
            departments {
                ${DEPARTMENT_FIELDS}
            }
        }`,
        { dataPath: "departments" }
    );
}

export const getDepartment = (id) =>{
   return requestGraphql(
    `query GetDepartment($id: Int!) {
      department(id: $id) {
        ${DEPARTMENT_FIELDS}
      }
    }`,
    {
      variables: { id: Number(id) },
      dataPath: "department",
    }
   );
}

export const saveDepartment = (data, id) =>{
    return requestGraphql(
      `mutation SaveDepartment($input: DepartmentInput!, $id: Int) {
        saveDepartment(input: $input, id: $id) {
          ${DEPARTMENT_FIELDS}
        }
      }`,
      {
        variables: {
          input: data,
          id: id ? Number(id) : undefined,
        },
        dataPath: "saveDepartment",
      }
    );
}

export const deleteDepartment = async (id) => {
    const response = await requestGraphql(
      `mutation DeleteDepartment($id: Int!) {
        deleteDepartment(id: $id) {
          success
        }
      }`,
      {
        variables: { id: Number(id) },
        dataPath: "deleteDepartment",
      }
    );

    return response?.code || response?.message ? response : null;
}
