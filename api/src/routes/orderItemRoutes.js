const { Router } = require("express");
const OrderItemController = require("../controllers/OrderItemController");

const router = Router();

router.get("/order/:order_id", OrderItemController.findByOrderId);
router.post("/", OrderItemController.create);
router.delete("/:id", OrderItemController.remove);
router.post("/:id/add-item", OrderItemController.addItem);
router.post("/:id/complete", OrderItemController.complete);
router.put("/:id", OrderItemController.update);

module.exports = router;
