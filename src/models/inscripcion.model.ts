import { pool } from "../database/index";

export const InscripcionModel = {
  async create({ estudiante_id, materia_id }: any) {
    const query = `
      INSERT INTO inscripciones (estudiante_id, materia_id)
      VALUES (?, ?)
    `;
    const [result] = await pool.execute(query, [estudiante_id, materia_id]);
    return { id: (result as any).insertId, estudiante_id, materia_id };
  },

  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM inscripciones");
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM inscripciones WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async findByEstudianteIdAndMateriaId(estudiante_id: number, materia_id: number) {
    const query = `SELECT * FROM inscripciones WHERE estudiante_id = ? AND materia_id = ?`;
    const [rows] = await pool.execute(query, [estudiante_id, materia_id]);
    return (rows as any[])[0];
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM inscripciones WHERE id = ?", [id]);
    return true;
  },
};
