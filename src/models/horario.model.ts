import { pool } from "../database/index";

export const HorarioModel = {
  async create({ materia_id, profesor_id, dia, hora_inicio, hora_fin }: any) {
    const query = `
      INSERT INTO horarios (materia_id, profesor_id, dia, hora_inicio, hora_fin)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [materia_id, profesor_id, dia, hora_inicio, hora_fin]);
    return { id: (result as any).insertId, materia_id, profesor_id, dia, hora_inicio, hora_fin };
  },

  async findAll(where: any = {}) {
    let query = "SELECT * FROM horarios";
    const values: any[] = [];

    if (Object.keys(where).length > 0) {
      query += " WHERE ";
      const conditions: string[] = Object.keys(where).map(key => {
        if (key === 'hora_inicio_lte') {
          values.push(where[key]);
          return `hora_inicio <= ?`;
        } else if (key === 'hora_fin_gte') {
          values.push(where[key]);
          return `hora_fin >= ?`;
        } else {
          values.push(where[key]);
          return `${key} = ?`;
        }
      });
      query += conditions.join(" AND ");
    }

    const [rows] = await pool.execute(query, values);
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM horarios WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async update(id: number, data: any) {
    const { materia_id, profesor_id, dia, hora_inicio, hora_fin } = data;
    await pool.execute(
      `UPDATE horarios SET materia_id=?, profesor_id=?, dia=?, hora_inicio=?, hora_fin=? WHERE id=?`,
      [materia_id, profesor_id, dia, hora_inicio, hora_fin, id]
    );
    return this.findById(id);
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM horarios WHERE id = ?", [id]);
    return true;
  }
};
