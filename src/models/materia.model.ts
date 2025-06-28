import { pool } from "../database/index.js";

export const MateriaModel = {
  async create({ nombre, descripcion }: any) {
    const query = `
      INSERT INTO materias (nombre, descripcion)
      VALUES (?, ?)
    `;
    const [result] = await pool.execute(query, [nombre, descripcion]);
    return { id: (result as any).insertId, nombre, descripcion };
  },

  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM materias");
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM materias WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async update(id: number, data: any) {
    const { nombre, descripcion } = data;
    await pool.execute(
      `UPDATE materias SET nombre=?, descripcion=? WHERE id=?`,
      [nombre, descripcion, id]
    );
    return this.findById(id);
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM materias WHERE id = ?", [id]);
    return true;
  }
};
