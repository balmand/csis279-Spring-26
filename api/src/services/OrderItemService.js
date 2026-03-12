const OrderItemRepository = require("../repositories/OrderItemRepository");
const OrderRepository = require("../repositories/OrderRepository");
const ApiError = require("../middlewares/ApiError");

class OrderItemService {
  static async findByOrderId(orderId) {
    try {
      console.log(`Service: Fetching items for order_id: ${orderId}`); // Log the order_id
      const order = await OrderItemRepository.findByOrderId(orderId);
      console.log("Service: Query Results:", order); // Log the query results
      if (!order || order.length === 0) {
        throw ApiError.notFound(`Order with id ${orderId} not found`);
      }
      return order;
    } catch (error) {
      console.error("Service: Error fetching order items:", error); // Log any errors
      throw error;
    }
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

  static addItem = async (orderId, { item_id, quantity }) => {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound(`Order with id ${orderId} not found`);
    }
    if (order.order_status === "completed") {
      throw ApiError.badRequest("Cannot add items to a completed order");
    }
    return OrderItemRepository.create({
      order_id: orderId,
      item_id,
      quantity,
      unit_price: item.unit_price,
    });
  };

  static async complete(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound(`Order with id ${orderId} not found`);
    }
    if (order.order_status === "completed") {
      return { order, alreadyCompleted: true };
    }
    const completed = await OrderRepository.complete(orderId);
    if (!completed) {
      throw ApiError.notFound(
        `Order with id ${orderId} not found or already completed`,
      );
    }
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
