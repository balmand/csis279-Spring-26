const OrderItemRepository = require("../repositories/OrderItemRepository");
const OrderRepository = require("../repositories/OrderRepository");
const ItemRepository = require("../repositories/ItemRepository");
const ApiError = require("../middlewares/ApiError");

class OrderItemService {
  static async findByOrderId(orderId) {
    const items = await OrderItemRepository.findByOrderId(orderId);
    if (!items || items.length === 0) {
      throw ApiError.notFound(`No items found for order ${orderId}`);
    }
    return items;
  }

  static async create(data) {
    return OrderItemRepository.create(data);
  }

  static async remove(id) {
    const success = await OrderItemRepository.remove(id);
    if (!success) {
      throw ApiError.notFound(`Order item with id ${id} not found`);
    }
  }

  static async addItem(orderId, { item_id, quantity }) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound(`Order with id ${orderId} not found`);
    }
    if (order.order_status === "completed") {
      throw ApiError.badRequest("Cannot add items to a completed order");
    }
    const item = await ItemRepository.findById(item_id);
    if (!item) {
      throw ApiError.notFound(`Item with id ${item_id} not found`);
    }
    return OrderItemRepository.create({
      order_id: orderId,
      item_id,
      quantity,
      unit_price: item.unit_price,
      unit_cost: item.unit_cost || 0,
    });
  }

  static async complete(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound(`Order with id ${orderId} not found`);
    }
    if (order.order_status === "completed") {
      return { order, alreadyCompleted: true };
    }
    const completed = await OrderRepository.markCompleted(orderId);
    if (!completed) {
      const refreshed = await OrderRepository.findById(orderId);
      return { order: refreshed, alreadyCompleted: true };
    }
    return { order: completed, alreadyCompleted: false };
  }

  static async update(id, data) {
    const updated = await OrderRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound(`Order with id ${id} not found`);
    }
    return updated;
  }
}

module.exports = OrderItemService;
