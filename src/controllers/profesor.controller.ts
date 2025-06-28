import { ProfesorModel } from "../models/profesor.model.js";

export const ProfesorController = {
  async create(req: any, res: any) {
    try {
      const profesor = await ProfesorModel.create(req.body);
      res.status(201).json({ ok: true, profesor });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const profesores = await ProfesorModel.findAll();
      res.json({ ok: true, profesores });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const profesor = await ProfesorModel.findById(Number(req.params.id));
      if (!profesor) return res.status(404).json({ ok: false, message: "No encontrado" });
      res.json({ ok: true, profesor });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async update(req: any, res: any) {
    try {
      const profesor = await ProfesorModel.update(Number(req.params.id), req.body);
      res.json({ ok: true, profesor });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async delete(req: any, res: any) {
    try {
      await ProfesorModel.delete(Number(req.params.id));
      res.json({ ok: true, message: "Eliminado" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};
