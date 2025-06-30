// Ejemplo de rutas
import { Router } from "express";
import { InscripcionController } from "../controllers/inscripcion.controller";

const router = Router();

router.post("/", InscripcionController.create);
router.get("/", InscripcionController.findAll);
router.get("/:id", InscripcionController.findById);
router.get("/buscar", InscripcionController.findByEstudianteAndMateria);
router.delete("/:id", InscripcionController.delete);

export default router;