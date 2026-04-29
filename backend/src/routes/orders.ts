import { Router } from "express";
import { placeOrderBodySchema, updateStatusBodySchema } from "../schemas.js";
import { emitOrderStatus } from "../realtime.js";
import {
  cancelOrderStatusAutomation,
  scheduleOrderStatusAutomation,
} from "../simulator.js";
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "../store/orders.js";
import { isAllowedStatusTransition } from "../types.js";

export const ordersRouter = Router();

ordersRouter.get("/", (_req, res) => {
  res.json(listOrders());
});

ordersRouter.get("/:id", (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

ordersRouter.post("/", (req, res, next) => {
  try {
    const body = placeOrderBodySchema.parse(req.body);
    let order;
    try {
      order = createOrder(
        body.items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
        body.delivery,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("Unknown menu item")) {
        res.status(400).json({ error: msg });
        return;
      }
      throw e;
    }
    emitOrderStatus(order.id, order.status, order.updatedAt);
    scheduleOrderStatusAutomation(order.id);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch("/:id/status", (req, res, next) => {
  try {
    const { status } = updateStatusBodySchema.parse(req.body);
    const existing = getOrder(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (!isAllowedStatusTransition(existing.status, status)) {
      res.status(400).json({
        error: "Invalid status transition",
        details: { from: existing.status, to: status },
      });
      return;
    }
    cancelOrderStatusAutomation(req.params.id);
    const updated = updateOrderStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    emitOrderStatus(updated.id, updated.status, updated.updatedAt);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

ordersRouter.delete("/:id", (req, res) => {
  const id = req.params.id;
  if (!getOrder(id)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  cancelOrderStatusAutomation(id);
  deleteOrder(id);
  res.status(204).send();
});
