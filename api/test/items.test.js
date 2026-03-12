const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');


let createdItemId;
const testItem = {
    item_name: 'Test Widget',
    item_sku: `TEST-SKU-${Date.now()}`,
    unit_price: 19.99,
    stock_quantity: 50,
};


afterAll(async () => {
    if (createdItemId) {
        await pool.query('DELETE FROM items WHERE item_id = $1', [createdItemId]).catch(() => {});
    }
    await pool.end();
});


describe('Items CRUD – POST /items', () => {
    it('should create a new item', async () => {
        const res = await request(app)
            .post('/items')
            .send(testItem)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(res.body).toHaveProperty('item_id');
        expect(res.body.item_name).toBe(testItem.item_name);
        expect(res.body.item_sku).toBe(testItem.item_sku);
        expect(parseFloat(res.body.unit_price)).toBe(testItem.unit_price);
        expect(res.body.stock_quantity).toBe(testItem.stock_quantity);
        createdItemId = res.body.item_id;
    });

    it('should reject a duplicate SKU', async () => {
        const res = await request(app)
            .post('/items')
            .send(testItem)
            .expect(409);

        expect(res.body).toHaveProperty('code', 'CONFLICT');
    });

    it('should reject missing required fields', async () => {
        const res = await request(app)
            .post('/items')
            .send({ item_name: 'No SKU' })
            .expect(400);

        expect(res.body).toHaveProperty('code', 'BAD_REQUEST');
        expect(res.body.details).toHaveProperty('item_sku');
    });
});

describe('Items CRUD – GET /items', () => {
    it('should return an array of items', async () => {
        const res = await request(app)
            .get('/items')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

describe('Items CRUD – GET /items/:id', () => {
    it('should return the created item', async () => {
        const res = await request(app)
            .get(`/items/${createdItemId}`)
            .expect(200);

        expect(res.body.item_id).toBe(createdItemId);
        expect(res.body.item_name).toBe(testItem.item_name);
    });

    it('should 404 for non-existent id', async () => {
        const res = await request(app)
            .get('/items/999999')
            .expect(404);

        expect(res.body).toHaveProperty('code', 'NOT_FOUND');
    });
});

describe('Items CRUD – PUT /items/:id', () => {
    it('should update the item', async () => {
        const updated = { ...testItem, item_name: 'Updated Widget', unit_price: 29.99 };
        const res = await request(app)
            .put(`/items/${createdItemId}`)
            .send(updated)
            .expect(200);

        expect(res.body.item_name).toBe('Updated Widget');
        expect(parseFloat(res.body.unit_price)).toBe(29.99);
    });
});

describe('Items CRUD – DELETE /items/:id', () => {
    it('should delete the item', async () => {
        const idToDelete = createdItemId;
        await request(app)
            .delete(`/items/${idToDelete}`)
            .expect(204);

        createdItemId = null;


        await request(app)
            .get(`/items/${idToDelete}`)
            .expect(404);
    });
});
