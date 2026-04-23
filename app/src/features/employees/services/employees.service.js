import { requestGraphql } from "../../../services/api";

const EMPLOYEE_FIELDS = `
  employee_id
  employee_name
  employee_email
  employee_role
  employee_dob
  employee_department
`;

export const getEmployees = () => {
    return requestGraphql(
        `query GetEmployees {
            employees {
                ${EMPLOYEE_FIELDS}
            }
        }`,
        { dataPath: "employees" }
    );
}

export const getEmployee = (id) => {
    return requestGraphql(
        `query GetEmployee($id: Int!) {
            employee(id: $id) {
                ${EMPLOYEE_FIELDS}
            }
        }`,
        {
            variables: { id: Number(id) },
            dataPath: "employee",
        }
    );
}

export const saveEmployee = (data, id) => {
    return requestGraphql(
        `mutation SaveEmployee($input: EmployeeInput!, $id: Int) {
            saveEmployee(input: $input, id: $id) {
                ${EMPLOYEE_FIELDS}
            }
        }`,
        {
            variables: {
                input: {
                    ...data,
                    employee_department: Number(data.employee_department),
                },
                id: id ? Number(id) : undefined,
            },
            dataPath: "saveEmployee",
        }
    );
}

export const deleteEmployee = async (id) => {
    const response = await requestGraphql(
        `mutation DeleteEmployee($id: Int!) {
            deleteEmployee(id: $id) {
                success
            }
        }`,
        {
            variables: { id: Number(id) },
            dataPath: "deleteEmployee",
        }
    );

    return response?.code || response?.message ? response : null;
}
