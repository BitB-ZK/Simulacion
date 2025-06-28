import { Router } from "express";
import { EstudianteController } from "../controllers/estudiante.controller.js";

const router = Router();

router.post("/", EstudianteController.create);
router.get("/", EstudianteController.findAll);
router.get("/:id", EstudianteController.findById);
router.put("/:id", EstudianteController.update);
router.delete("/:id", EstudianteController.delete);

export default router;
