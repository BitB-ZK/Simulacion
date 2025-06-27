import { Router } from "express";
import { MateriaController } from "../controllers/materia.controller";

const router = Router();

router.post("/", MateriaController.create);
router.get("/", MateriaController.findAll);
router.get("/:id", MateriaController.findById);
router.put("/:id", MateriaController.update);
router.delete("/:id", MateriaController.delete);

export default router;