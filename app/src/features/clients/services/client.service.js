import { requestGraphql } from "../../../services/api";

const CLIENT_FIELDS = `
  client_id
  client_name
  client_email
  client_dob
  role
`;

export const getClients = () => {
    return requestGraphql(
        `query GetClients {
            clients {
                ${CLIENT_FIELDS}
            }
        }`,
        { dataPath: "clients" }
    );
}

export const getClient = (id) =>{
    return requestGraphql(
        `query GetClient($id: Int!) {
            client(id: $id) {
                ${CLIENT_FIELDS}
            }
        }`,
        {
            variables: { id: Number(id) },
            dataPath: "client",
        }
    );
}

export const saveClient = (data, id) => {
    return requestGraphql(
        `mutation SaveClient($input: ClientInput!, $id: Int) {
            saveClient(input: $input, id: $id) {
                ${CLIENT_FIELDS}
            }
        }`,
        {
            variables: {
                input: data,
                id: id ? Number(id) : undefined,
            },
            dataPath: "saveClient",
        }
    );
}

export const deleteUser = async (id) =>{
    const response = await requestGraphql(
        `mutation DeleteClient($id: Int!) {
            deleteClient(id: $id) {
                success
            }
        }`,
        {
            variables: { id: Number(id) },
            dataPath: "deleteClient",
        }
    );

    return response?.code || response?.message ? response : null;
}

export const sendClientEmail = async (data) => {
  return requestGraphql(
    `mutation SendClientEmail($input: SendEmailInput!) {
      sendClientEmail(input: $input) {
        success
        message
      }
    }`,
    {
      variables: { input: data },
      dataPath: "sendClientEmail",
    }
  );
};
