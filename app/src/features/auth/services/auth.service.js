import { requestGraphql } from "../../../services/api";

export const login = ({ client_email, password }) => {
    return requestGraphql(
        `mutation Login($input: LoginInput!) {
            login(input: $input) {
                authenticated
                client {
                    client_id
                    client_name
                    client_email
                    client_dob
                    role
                }
            }
        }`,
        {
            variables: {
                input: { client_email, password },
            },
            includeMeta: true,
            dataPath: "login",
        }
    );
};

export const register = ({ client_name, client_email, client_dob, password, role }) => {
    return requestGraphql(
        `mutation Register($input: RegisterInput!) {
            register(input: $input) {
                client_id
                client_name
                client_email
                client_dob
                role
            }
        }`,
        {
            variables: {
                input: { client_name, client_email, client_dob, password, role },
            },
            includeMeta: true,
            dataPath: "register",
        }
    );
};
