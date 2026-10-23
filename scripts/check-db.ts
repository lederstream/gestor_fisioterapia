import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
  console.log("Users columns:", res.rows.map(r => `${r.column_name} (${r.data_type})`));
  
  const pacientesRes = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'pacientes';
  `);
  console.log("Pacientes columns:", pacientesRes.rows.map(r => `${r.column_name} (${r.data_type})`));

  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
