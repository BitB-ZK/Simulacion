import { pool } from "../database/index";

export const ClaseModel = {
  async create({ horario_id, profesor_id, fecha_clase, hora_inicio_real, hora_fin_real, profesor_asistio }: any) {
    const query = `
      INSERT INTO clases (horario_id, profesor_id, fecha_clase, hora_inicio_real, hora_fin_real, profesor_asistio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      horario_id,
      profesor_id,
      fecha_clase,
      hora_inicio_real,
      hora_fin_real,
      profesor_asistio
    ]);
    return { id: (result as any).insertId, horario_id, profesor_id, fecha_clase, hora_inicio_real, hora_fin_real, profesor_asistio };
  },

  async findAll(where: any = {}) {
    let query = "SELECT * FROM clases";
    const values: any[] = [];

    if (Object.keys(where).length > 0) {
      query += " WHERE ";
      const conditions = Object.keys(where).map((key) => `${key} = ?`);
      query += conditions.join(" AND ");
      Object.values(where).forEach((value) => values.push(value));
    }

    const [rows] = await pool.execute(query, values);
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM clases WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async update(id: number, data: any) {
    const { horario_id, profesor_id, fecha_clase, hora_inicio_real, hora_fin_real, profesor_asistio } = data;
    await pool.execute(
      `UPDATE clases SET horario_id=?, profesor_id=?, fecha_clase=?, hora_inicio_real=?, hora_fin_real=?, profesor_asistio=? WHERE id=?`,
      [horario_id, profesor_id, fecha_clase, hora_inicio_real, hora_fin_real, profesor_asistio, id]
    );
    return this.findById(id);
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM clases WHERE id = ?", [id]);
    return true;
  }
};
