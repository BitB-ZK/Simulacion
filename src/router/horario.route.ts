import { Router } from "express";
import { HorarioController } from "../controllers/horario.controller.js";

const router = Router();

router.post("/", HorarioController.create);
router.get("/", HorarioController.findAll);
router.get("/:id", HorarioController.findById);
router.put("/:id", HorarioController.update);
router.delete("/:id", HorarioController.delete);

export default router;
