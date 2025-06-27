import { Router } from "express";
import { ClaseController } from "../controllers/clase.controller";

const router = Router();

router.post("/", ClaseController.create);
router.get("/", ClaseController.findAll);
router.get("/:id", ClaseController.findById);
router.put("/:id", ClaseController.update);
router.delete("/:id", ClaseController.delete);

export default router;