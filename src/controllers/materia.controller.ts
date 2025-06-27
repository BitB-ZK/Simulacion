import { MateriaModel } from "../models/materia.model";

export const MateriaController = {
  async create(req: any, res: any) {
    try {
      const materia = await MateriaModel.create(req.body);
      res.status(201).json({ ok: true, materia });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const materias = await MateriaModel.findAll();
      res.json({ ok: true, materias });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const materia = await MateriaModel.findById(Number(req.params.id));
      if (!materia) return res.status(404).json({ ok: false, message: "No encontrado" });
      res.json({ ok: true, materia });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async update(req: any, res: any) {
    try {
      const materia = await MateriaModel.update(Number(req.params.id), req.body);
      res.json({ ok: true, materia });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async delete(req: any, res: any) {
    try {
      await MateriaModel.delete(Number(req.params.id));
      res.json({ ok: true, message: "Eliminado" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};