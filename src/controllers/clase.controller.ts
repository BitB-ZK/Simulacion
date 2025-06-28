import { ClaseModel } from "../models/clase.model.js";

export const ClaseController = {
  async create(req: any, res: any) {
    try {
      const clase = await ClaseModel.create(req.body);
      res.status(201).json({ ok: true, clase });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const clases = await ClaseModel.findAll();
      res.json({ ok: true, clases });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const clase = await ClaseModel.findById(Number(req.params.id));
      if (!clase) return res.status(404).json({ ok: false, message: "No encontrado" });
      res.json({ ok: true, clase });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async update(req: any, res: any) {
    try {
      const clase = await ClaseModel.update(Number(req.params.id), req.body);
      res.json({ ok: true, clase });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async delete(req: any, res: any) {
    try {
      await ClaseModel.delete(Number(req.params.id));
      res.json({ ok: true, message: "Eliminado" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};
