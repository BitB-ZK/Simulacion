import { Router } from "express";
import { ProfesorController } from "../controllers/profesor.controller";

const router = Router();

router.post("/", ProfesorController.create);
router.get("/", ProfesorController.findAll);
router.get("/:id", ProfesorController.findById);
router.put("/:id", ProfesorController.update);
router.delete("/:id", ProfesorController.delete);

export default router;