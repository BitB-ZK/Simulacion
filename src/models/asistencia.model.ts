import { pool } from "../database/index.js";

export const AsistenciaEstudianteModel = {
  async create({ clase_id, estudiante_id, fecha_hora_entrada }: any) {
    const query = `
      INSERT INTO asistencia_estudiantes (clase_id, estudiante_id, fecha_hora_entrada)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [clase_id, estudiante_id, fecha_hora_entrada]);
    return { id: (result as any).insertId, clase_id, estudiante_id, fecha_hora_entrada };
  },
  async findByClaseAndEstudiante(clase_id: number, estudiante_id: number) {
    const [rows] = await pool.execute(
      "SELECT * FROM asistencia_estudiantes WHERE clase_id = ? AND estudiante_id = ?",
      [clase_id, estudiante_id]
    );
    return rows;
  },
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM asistencia_estudiantes");
    return rows;
  },

  async findById(id: number) {
    const [rows] = await pool.execute("SELECT * FROM asistencia_estudiantes WHERE id = ?", [id]);
    return (rows as any[])[0];
  },

  async update(id: number, data: any) {
    const { clase_id, estudiante_id, fecha_hora_entrada } = data;
    await pool.execute(
      `UPDATE asistencia_estudiantes SET clase_id=?, estudiante_id=?, fecha_hora_entrada=? WHERE id=?`,
      [clase_id, estudiante_id, fecha_hora_entrada, id]
    );
    return this.findById(id);
  },

  async delete(id: number) {
    await pool.execute("DELETE FROM asistencia_estudiantes WHERE id = ?", [id]);
    return true;
  },

  async getAttendanceSummary(claseId: number) {
    const query = `
      SELECT
        m.nombre AS materia,
        CONCAT(p.nombre, ' ', p.apellido) AS profesor,
        COUNT(ae.estudiante_id) AS cantidadEstudiantes
      FROM asistencia_estudiantes ae
      INNER JOIN clases c ON ae.clase_id = c.id
      INNER JOIN horarios h ON c.horario_id = h.id
      INNER JOIN materias m ON h.materia_id = m.id
      INNER JOIN profesores p ON c.profesor_id = p.id
      WHERE ae.clase_id = ?
    `;
    const [rows] = await pool.execute(query, [claseId]);
    return (rows as any[])[0];
  },
  async getAsistenciaPorClase(clase_id: number) {
    const query = `
      SELECT 
        e.id AS estudiante_id,
        e.nombre,
        e.apellido,
        e.cedula,
        a.fecha_hora_entrada
      FROM asistencia_estudiantes a
      JOIN estudiantes e ON a.estudiante_id = e.id
      WHERE a.clase_id = ?
      ORDER BY a.fecha_hora_entrada ASC
    `;
    const [rows] = await pool.execute(query, [clase_id]);
    return rows;
  },
};
