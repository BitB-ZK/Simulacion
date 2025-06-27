import { pool } from "../database/index";

export const EstudianteModel = {
  async create({ nombre, apellido, cedula, carrera, rfid_id }: any) {
    const query = `
      INSERT INTO estudiantes (nombre, apellido, cedula, carrera, rfid_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [nombre, apellido, cedula, carrera, rfid_id]);
    return { id: (result as any).insertId, nombre, apellido, cedula, carrera, rfid_id };
  },

  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM estudiantes");
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM estudiantes WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async update(id: number, data: any) {
    const { nombre, apellido, cedula, carrera, rfid_id } = data;
    await pool.execute(
      `UPDATE estudiantes SET nombre=?, apellido=?, cedula=?, carrera=?, rfid_id=? WHERE id=?`,
      [nombre, apellido, cedula, carrera, rfid_id, id]
    );
    return this.findById(id);
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM estudiantes WHERE id = ?", [id]);
    return true;
  },
  
  async findByRfid(rfid_id: string) {
    const [rows] = await pool.execute("SELECT * FROM estudiantes WHERE rfid_id = ?", [rfid_id]);
    return (rows as any[])[0];
  }
};
