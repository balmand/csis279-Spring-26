const test = require("node:test");
const assert = require("node:assert");

const {
  createAdjustment,
  getAdjustmentsByItem
} = require("../stockAdjustments");

const {
  createOrder
} = require("../orders");

const {
  getItemById
} = require("../items");

const itemId = 1;
let initialStock;

test("get initial stock", async () => {
  const item = await getItemById(itemId);
  initialStock = item.stock_quantity;

  assert.ok(item);
  assert.ok(item.stock_quantity >= 0);
});

test("stock IN (increase inventory)", async () => {
  await createAdjustment({
    item_id: itemId,
    quantity_change: 10,
    reason: "restock"
  });

  const item = await getItemById(itemId);

  assert.equal(item.stock_quantity, initialStock + 10);
});

test("stock OUT (decrease inventory)", async () => {
  await createAdjustment({
    item_id: itemId,
    quantity_change: -5,
    reason: "damaged items"
  });

  const item = await getItemById(itemId);

  assert.equal(item.stock_quantity, initialStock + 5);
});

test("manual stock adjustment", async () => {
  const adjustment = await createAdjustment({
    item_id: itemId,
    quantity_change: 2,
    reason: "manual correction"
  });

  assert.ok(adjustment.adjustment_id);
  assert.equal(adjustment.item_id, itemId);
});

test("order triggers stock movement", async () => {
  const beforeOrder = await getItemById(itemId);

  await createOrder({
    client_id: 1,
    order_date: "2026-03-10",
    order_total: 50,
    order_status: "pending",
    items: [
      {
        item_id: itemId,
        quantity: 3
      }
    ]
  });

  const afterOrder = await getItemById(itemId);

  assert.equal(
    afterOrder.stock_quantity,
    beforeOrder.stock_quantity - 3
  );
});

test("stock cannot go negative", async () => {
  try {
    await createAdjustment({
      item_id: itemId,
      quantity_change: -9999,
      reason: "test negative"
    });

    assert.fail("Stock should not go negative");
  } catch (err) {
    assert.ok(err);
  }
});