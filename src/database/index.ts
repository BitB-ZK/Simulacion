import mysql, { Pool, RowDataPacket } from "mysql2/promise";

const connectionConfig = {
  host: "tramway.proxy.rlwy.net",
  user: "root",
  password: "oMKFCeGwQnrVkRTBKqxzMsgSDIvoqvFc",
  database: "laboratorio", 
  port: 16605, 
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