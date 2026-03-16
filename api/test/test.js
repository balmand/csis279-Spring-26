const request = require("supertest");
const app = require("../src/app");

describe("Clients API", () => {

  let createdId;

  test("Create client", async () => {
    const res = await request(app)
      .post("/clients")
      .send({
        name: "John Doe",
        email: "john@test.com"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("client_id");

    createdId = res.body.client_id;
  });

  test("Get all clients", async () => {
    const res = await request(app).get("/clients");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Get client by id", async () => {
    const res = await request(app).get(`/clients/${createdId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.client_id).toBe(createdId);
  });

  test("Update client", async () => {
    const res = await request(app)
      .put(`/clients/${createdId}`)
      .send({
        name: "Updated",
        email: "updated@test.com"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.client_name).toBe("Updated");
  });

  test("Delete client", async () => {
    const res = await request(app)
      .delete(`/clients/${createdId}`);

    expect(res.statusCode).toBe(204);
  });

});