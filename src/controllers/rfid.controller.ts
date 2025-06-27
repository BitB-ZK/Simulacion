import { EstudianteModel } from "../models/estudiante.model";
import { ProfesorModel } from "../models/profesor.model";
import { ClaseModel } from "../models/clase.model";
import { HorarioModel } from "../models/horario.model";
import { MateriaModel } from "../models/materia.model";
import { AsistenciaEstudianteModel } from "../models/asistencia.model";
import { InscripcionModel } from "../models/inscripcion.model";

export const RfidController = {
  async getEstudianteByRfid(req: any, res: any) {
    try {
      const { rfid } = req.params;
      const estudiante = await EstudianteModel.findByRfid(rfid);
      if (!estudiante) {
        return res.status(404).json({ ok: false, message: "Estudiante no encontrado" });
      }
      res.json({ ok: true, estudiante });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async getProfesorByRfid(req: any, res: any) {
    try {
      const { rfid } = req.params;
      const profesor = await ProfesorModel.findByRfid(rfid);
      if (!profesor) {
        return res.status(404).json({ ok: false, message: "Profesor no encontrado" });
      }
      res.json({ ok: true, profesor });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },

  async iniciarClaseConRfid(req: any, res: any) {
  try {
    const { rfid } = req.body;
    const { dia, hora } = req.body;

    const profesor = await ProfesorModel.findByRfid(rfid);
    if (!profesor) {
      return res.status(404).json({ ok: false, message: "Profesor no encontrado" });
    }

    // Buscar horarios del profesor para el día y hora actual
    const horariosResult = await HorarioModel.findAll({
      profesor_id: profesor.id,
      dia,
      hora_inicio_lte: hora,
      hora_fin_gte: hora
    });

    const horarios = horariosResult as any[];

    if (!horarios || horarios.length === 0) {
      return res.status(404).json({ ok: false, message: "No se encontró un horario para este profesor en este momento" });
    }

    const horario = horarios[0];

    // Verificar si ya hay una clase iniciada para este horario, profesor y fecha (sin hora_fin_real)
    const fechaHoy = new Date().toISOString().split('T')[0];
    const clasesIniciadasResult = await ClaseModel.findAll({
      horario_id: horario.id,
      profesor_id: profesor.id,
      fecha_clase: fechaHoy,
      hora_fin_real: null
    });
    const clasesIniciadas = Array.isArray(clasesIniciadasResult) ? clasesIniciadasResult : [];

    if (clasesIniciadas.length > 0) {
      // Obtener nombre de la materia
      const materiaInfo = await MateriaModel.findById(horario.materia_id);
      return res.status(200).json({
        ok: false,
        message: `La clase de ${materiaInfo ? materiaInfo.nombre : "Desconocida"} ya ha sido iniciada`
      });
    }

    // Crear una nueva clase
    const clase = await ClaseModel.create({
      horario_id: horario.id,
      profesor_id: profesor.id,
      fecha_clase: fechaHoy,
      hora_inicio_real: hora,
      hora_fin_real: null,
      profesor_asistio: true
    });

    // Obtener información adicional de la materia y el profesor
    const materiaInfo = await MateriaModel.findById(horario.materia_id);
    const profesorInfo = await ProfesorModel.findById(profesor.id);

    res.status(201).json({
      ok: true,
      clase,
      materia: materiaInfo ? materiaInfo.nombre : "Desconocida",
      profesor: profesorInfo ? `${profesorInfo.nombre} ${profesorInfo.apellido}` : "Desconocido",
      message: "Clase iniciada con éxito"
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
  }
},

  async registrarAsistenciaConRfid(req: any, res: any) {
    try {
      const { rfid, claseId } = req.body;

      const estudiante = await EstudianteModel.findByRfid(rfid);
      if (!estudiante) {
        return res.status(404).json({ ok: false, message: "Estudiante no encontrado" });
      }

      const clase = await ClaseModel.findById(claseId);
      if (!clase) {
        return res.status(404).json({ ok: false, message: "Clase no encontrada" });
      }

      // Verificar si el estudiante está inscrito en la materia de la clase
      const horario = await HorarioModel.findById(clase.horario_id);
      const inscripcion = await InscripcionModel.findByEstudianteIdAndMateriaId(estudiante.id, horario.materia_id);
      if (!inscripcion) {
        return res.status(403).json({ ok: false, message: "Estudiante no inscrito en esta materia" });
      }

      // Registrar la asistencia
      const now = new Date();
      const fecha_hora_entrada = now.getFullYear() + '-' + 
                                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(now.getDate()).padStart(2, '0') + ' ' + 
                                 String(now.getHours()).padStart(2, '0') + ':' + 
                                 String(now.getMinutes()).padStart(2, '0') + ':' + 
                                 String(now.getSeconds()).padStart(2, '0');
      const asistencia = await AsistenciaEstudianteModel.create({
        clase_id: claseId,
        estudiante_id: estudiante.id,
        fecha_hora_entrada: fecha_hora_entrada
      });

      res.status(201).json({ ok: true, asistencia, message: "Asistencia registrada con éxito" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  },
   async terminarClase(req: any, res: any) {
    try {
      const { claseId, hora_fin } = req.body;
      console.log("Terminar clase con ID:", claseId, "y hora de fin:", hora_fin);
      const clase = await ClaseModel.findById(claseId);
      if (!clase) {
        return res.status(404).json({ ok: false, message: "Clase no encontrada" });
      }

      // Actualizar la clase con la hora de finalización real
      const claseActualizada = await ClaseModel.update(claseId, {
        ...clase,
        hora_fin_real: hora_fin
      });

      res.status(200).json({ ok: true, clase: claseActualizada, message: "Clase finalizada con éxito" });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
    }
  }
};
