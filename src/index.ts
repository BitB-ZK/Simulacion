import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import homeRoute from "./router/home.route.js";
import { db } from "./database/index.js";
import estudianteRoutes from "./router/estudiante.route.js";
import profesorRoutes from "./router/profesor.route.js";
import materiaRoutes from "./router/materia.route.js";
import horarioRoutes from "./router/horario.route.js";
import claseRoutes from "./router/clase.route.js";
import asistenciaRoutes from "./router/asistencia.route.js";
import rfidRoutes from "./router/rfid.route.js";
import incripcionRoutes from "./router/inscripcion.route.js";

// Inicializar la conexión a la base de datos
db()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection failed:", error));

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Current directory:", __dirname);

const app = express();

app.use(cors()); // <--- Habilita CORS para cualquier origen

// Middleware para manejar JSON
app.use(express.json());

// Rutas
app.use("/home", homeRoute);
app.use("/estudiantes", estudianteRoutes);
app.use("/profesores", profesorRoutes);
app.use("/materias", materiaRoutes);
app.use("/horarios", horarioRoutes);
app.use("/clases", claseRoutes);
app.use("/asistencia", asistenciaRoutes);
app.use("/rfid", rfidRoutes);
app.use("/inscripciones", incripcionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});