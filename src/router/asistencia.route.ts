import { Router } from "express";
import { AsistenciaEstudianteController } from "../controllers/asistencia.controller.js";

const router = Router();

router.post("/", AsistenciaEstudianteController.create);
router.get("/", AsistenciaEstudianteController.findAll);
router.get("/:id", AsistenciaEstudianteController.findById);
router.put("/:id", AsistenciaEstudianteController.update);
router.delete("/:id", AsistenciaEstudianteController.delete);
router.get("/summary/:claseId", AsistenciaEstudianteController.getAttendanceSummary);
router.get("/clase/:claseId", AsistenciaEstudianteController.getAsistenciaPorClase);

export default router;
