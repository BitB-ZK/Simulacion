import { HorarioModel } from "../models/horario.model";

export const HorarioController = {
  async create(req: any, res: any) {
    try {
      const horario = await HorarioModel.create(req.body);
      res.status(201).json({ ok: true, horario });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findAll(req: any, res: any) {
    try {
      const horarios = await HorarioModel.findAll();
      res.json({ ok: true, horarios });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async findById(req: any, res: any) {
    try {
      const horario = await HorarioModel.findById(Number(req.params.id));
      if (!horario) return res.status(404).json({ ok: false, message: "No encontrado" });
      res.json({ ok: true, horario });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async update(req: any, res: any) {
    try {
      const horario = await HorarioModel.update(Number(req.params.id), req.body);
      res.json({ ok: true, horario });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async delete(req: any, res: any) {
    try {
      await HorarioModel.delete(Number(req.params.id));
      res.json({ ok: true, message: "Eliminado" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};