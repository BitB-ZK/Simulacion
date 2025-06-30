import { Request, Response } from "express";
import { InscripcionModel } from "../models/inscripcion.model.js";

export const InscripcionController = {
  async create(req: any, res: any) {
    try {
      const { estudiante_id, materia_id } = req.body;
      const inscripcion = await InscripcionModel.create({ estudiante_id, materia_id });
      res.status(201).json({ ok: true, inscripcion });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al crear inscripción", error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const inscripciones = await InscripcionModel.findAll();
      res.json({ ok: true, inscripciones });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al obtener inscripciones", error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const { id } = req.params;
      const inscripcion = await InscripcionModel.findById(Number(id));
      if (!inscripcion) {
        return res.status(404).json({ ok: false, message: "Inscripción no encontrada" });
      }
      res.json({ ok: true, inscripcion });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al buscar inscripción", error });
    }
  },

  async findByEstudianteAndMateria(req: any, res: any) {
    try {
      const { estudiante_id, materia_id } = req.query;
      const inscripcion = await InscripcionModel.findByEstudianteIdAndMateriaId(
        Number(estudiante_id),
        Number(materia_id)
      );
      if (!inscripcion) {
        return res.status(404).json({ ok: false, message: "Inscripción no encontrada" });
      }
      res.json({ ok: true, inscripcion });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al buscar inscripción", error });
    }
  },

  async delete(req: any, res: any) {
    try {
      const { id } = req.params;
      await InscripcionModel.delete(Number(id));
      res.json({ ok: true, message: "Inscripción eliminada" });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al eliminar inscripción", error });
    }
  },
};