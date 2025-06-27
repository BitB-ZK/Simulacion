import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import homeRoute from "./router/home.route";
import { db } from "./database/index";
import estudianteRoutes from "./router/estudiante.route";
import profesorRoutes from "./router/profesor.route";
import materiaRoutes from "./router/materia.route";
import horarioRoutes from "./router/horario.route";
import claseRoutes from "./router/clase.route";
import asistenciaRoutes from "./router/asistencia.route";
import rfidRoutes from "./router/rfid.route";


// Inicializar la conexión a la base de datos
db()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection failed:", error));

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Current directory:", __dirname);

const app = express();

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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
