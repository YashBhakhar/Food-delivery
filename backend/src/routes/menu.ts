import { Router } from "express";
import { getMenu, getMenuItemById } from "../store/menu.js";

export const menuRouter = Router();

menuRouter.get("/", (_req, res) => {
  res.json(getMenu());
});

menuRouter.get("/:id", (req, res) => {
  const item = getMenuItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(item);
});
