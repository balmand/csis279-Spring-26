import { requestGraphql } from "../../../services/api";

const FEEDBACK_FIELDS = `
  id
  comment
  rate
`;

export const getFeedbacks = () => {
  return requestGraphql(
    `
      query GetFeedbacks {
        feedbacks {
          ${FEEDBACK_FIELDS}
        }
      }
    `,
    { dataPath: "feedbacks" }
  );
};

export const getFeedback = (id) => {
  return requestGraphql(
    `
      query GetFeedback($id: Int!) {
        feedback(id: $id) {
          ${FEEDBACK_FIELDS}
        }
      }
    `,
    {
      variables: { id: Number(id) },
      dataPath: "feedback",
    }
  );
};

export const saveFeedback = (data, id) => {
  return requestGraphql(
    `
      mutation SaveFeedback($input: FeedbackInput!, $id: Int) {
        saveFeedback(input: $input, id: $id) {
          ${FEEDBACK_FIELDS}
        }
      }
    `,
    {
      variables: {
        input: {
          comment: data.comment,
          rate: Number(data.rate),
        },
        id: id ? Number(id) : undefined,
      },
      dataPath: "saveFeedback",
    }
  );
};

export const deleteFeedback = (id) => {
  return requestGraphql(
    `
      mutation DeleteFeedback($id: Int!) {
        deleteFeedback(id: $id) {
          success
        }
      }
    `,
    {
      variables: { id: Number(id) },
      dataPath: "deleteFeedback",
    }
  );
};