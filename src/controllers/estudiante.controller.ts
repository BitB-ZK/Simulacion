import { EstudianteModel } from "../models/estudiante.model.js";

export const EstudianteController = {
  async create(req: any, res: any) {
    try {
      const estudiante = await EstudianteModel.create(req.body);
      res.status(201).json({ ok: true, estudiante });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const estudiantes = await EstudianteModel.findAll();
      res.json({ ok: true, estudiantes });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const estudiante = await EstudianteModel.findById(Number(req.params.id));
      if (!estudiante) return res.status(404).json({ ok: false, message: "No encontrado" });
      res.json({ ok: true, estudiante });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async update(req: any, res: any) {
    try {
      const estudiante = await EstudianteModel.update(Number(req.params.id), req.body);
      res.json({ ok: true, estudiante });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async delete(req: any, res: any) {
    try {
      await EstudianteModel.delete(Number(req.params.id));
      res.json({ ok: true, message: "Eliminado" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};
