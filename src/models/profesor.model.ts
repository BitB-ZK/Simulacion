import { pool } from "../database/index";

export const ProfesorModel = {
  async create({ nombre, apellido, cedula, rfid_id }: any) {
    const query = `
      INSERT INTO profesores (nombre, apellido, cedula, rfid_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [nombre, apellido, cedula, rfid_id]);
    return { id: (result as any).insertId, nombre, apellido, cedula, rfid_id };
  },

  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM profesores");
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM profesores WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async update(id: number, data: any) {
    const { nombre, apellido, cedula, rfid_id } = data;
    await pool.execute(
      `UPDATE profesores SET nombre=?, apellido=?, cedula=?, rfid_id=? WHERE id=?`,
      [nombre, apellido, cedula, rfid_id, id]
    );
    return this.findById(id);
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM profesores WHERE id = ?", [id]);
    return true;
  },
  
  async findByRfid(rfid_id: string) {
    const [rows] = await pool.execute("SELECT * FROM profesores WHERE rfid_id = ?", [rfid_id]);
    return (rows as any[])[0];
  }
};
