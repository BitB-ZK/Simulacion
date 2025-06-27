import mysql, { Pool, RowDataPacket } from "mysql2/promise";

const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "laboratorio", 
  port: 3306, 
};

export const pool: Pool = mysql.createPool(connectionConfig);

export const db = async (): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT NOW()");
    console.log("MySQL connected:", rows[0]["NOW()"]);
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
  }
};