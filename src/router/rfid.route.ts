import { Router } from "express";
import { RfidController } from "../controllers/rfid.controller";

const router = Router();

router.get("/estudiante/:rfid", RfidController.getEstudianteByRfid);
router.get("/profesor/:rfid", RfidController.getProfesorByRfid);
router.post("/iniciar-clase", RfidController.iniciarClaseConRfid);
router.post("/registrar-asistencia", RfidController.registrarAsistenciaConRfid);
router.post("/terminar-clase", RfidController.terminarClase);
export default router;
