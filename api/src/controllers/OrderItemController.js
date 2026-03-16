const OrderItemService = require("../services/OrderItemService");

class OrderItemController {
  static async findByOrderId(req, res, next) {
    try {
      const orderItems = await OrderItemService.findByOrderId(
        req.params.order_id,
      );
      return res.json(orderItems);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const orderItem = await OrderItemService.create(req.body);
      return res.status(201).json(orderItem);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      await OrderItemService.remove(req.params.id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req, res, next) {
    try {
      const orderItem = await OrderItemService.addItem(req.params.id, req.body);
      return res.status(201).json(orderItem);
    } catch (err) {
      next(err);
    }
  }

  static async complete(req, res, next) {
    try {
      const result = await OrderItemService.complete(req.params.id);
      if (result.alreadyCompleted) {
        return res.json({
          message: "Order was already completed",
          order: result.order,
        });
      }
      return res.json({
        message: "Order completed successfully",
        order: result.order,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const order = await OrderItemService.update(req.params.id, req.body);
      return res.json(order);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderItemController;
