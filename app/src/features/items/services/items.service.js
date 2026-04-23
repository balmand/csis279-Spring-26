import { requestGraphql } from "../../../services/api";

const ITEM_FIELDS = `
  item_id
  item_name
  item_sku
  unit_price
  stock_quantity
  category
`;

export const getItems = async () => {
    const res = await requestGraphql(
        `query GetItems {
            items {
                ${ITEM_FIELDS}
            }
        }`,
        { dataPath: "items" }
    );
    return Array.isArray(res) ? res : [];
};

export const getItem = (id) => {
    return requestGraphql(
        `query GetItem($id: Int!) {
            item(id: $id) {
                ${ITEM_FIELDS}
            }
        }`,
        {
            variables: { id: Number(id) },
            dataPath: "item",
        }
    );
}

export const saveItem = async (data, id) => {
    return await requestGraphql(
        `mutation SaveItem($input: ItemInput!, $id: Int) {
            saveItem(input: $input, id: $id) {
                ${ITEM_FIELDS}
            }
        }`,
        {
            variables: {
                input: {
                    ...data,
                    unit_price: Number(data.unit_price),
                    stock_quantity: Number(data.stock_quantity || 0),
                },
                id: id ? Number(id) : undefined,
            },
            dataPath: "saveItem",
        }
    );
}

export const deleteItem = async (id) => {
    const response = await requestGraphql(
        `mutation DeleteItem($id: Int!) {
            deleteItem(id: $id) {
                success
            }
        }`,
        {
            variables: { id: Number(id) },
            dataPath: "deleteItem",
        }
    );

    return response?.code || response?.message ? response : null;
}
export const adjustStock = async (id, quantityChange) => {
    return await requestGraphql(
        `mutation AdjustItemStock($id: Int!, $quantityChange: Int!) {
            adjustItemStock(id: $id, quantityChange: $quantityChange) {
                ${ITEM_FIELDS}
            }
        }`,
        {
            variables: {
                id: Number(id),
                quantityChange: Number(quantityChange),
            },
            dataPath: "adjustItemStock",
        }
    );
};
