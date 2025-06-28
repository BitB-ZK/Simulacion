import { AsistenciaEstudianteModel } from "../models/asistencia.model.js";
import { ClaseModel } from "../models/clase.model.js";
import { MateriaModel } from "../models/materia.model.js";
import { ProfesorModel } from "../models/profesor.model.js";

export const AsistenciaEstudianteController = {
  async create(req: any, res: any) {
    try {
      const asistencia = await AsistenciaEstudianteModel.create(req.body);
      res.status(201).json({ ok: true, asistencia });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const asistencias = await AsistenciaEstudianteModel.findAll();
      res.json({ ok: true, asistencias });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const asistencia = await AsistenciaEstudianteModel.findById(Number(req.params.id));
      if (!asistencia) return res.status(404).json({ ok: false, message: "No encontrado" });
      res.json({ ok: true, asistencia });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async update(req: any, res: any) {
    try {
      const asistencia = await AsistenciaEstudianteModel.update(Number(req.params.id), req.body);
      res.json({ ok: true, asistencia });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async delete(req: any, res: any) {
    try {
      await AsistenciaEstudianteModel.delete(Number(req.params.id));
      res.json({ ok: true, message: "Eliminado" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async getAttendanceSummary(req: any, res: any) {
    try {
      const claseId = Number(req.params.claseId);

      const summary = await AsistenciaEstudianteModel.getAttendanceSummary(claseId);

      if (!summary) {
        return res.status(404).json({ ok: false, message: "No se encontró información para la clase especificada" });
      }

      res.json({
        ok: true,
        materia: summary.materia,
        profesor: summary.profesor,
        cantidadEstudiantes: summary.cantidadEstudiantes,
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};
