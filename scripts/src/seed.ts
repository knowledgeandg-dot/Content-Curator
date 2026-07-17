import bcrypt from "bcryptjs";
import pg from "pg";

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await client.connect();

  // CRM Admin user
  const hash = await bcrypt.hash("admin123", 10);
  await client.query(
    `INSERT INTO crm_users (name, email, password_hash, role)
     VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING`,
    ["CRM Admin", "admin@dreamvalley.com", hash, "crm"],
  );

  // RM Codes
  const rms = [
    ["RM001", "Rahul Sharma", "Active"],
    ["RM002", "Priya Mehta", "Active"],
    ["RM003", "Amit Singh", "Active"],
    ["RM004", "Neha Gupta", "Inactive"],
  ];
  for (const [code, name, status] of rms) {
    await client.query(
      `INSERT INTO rm_codes (rm_code, sales_person_name, status)
       VALUES ($1,$2,$3) ON CONFLICT (rm_code) DO NOTHING`,
      [code, name, status],
    );
  }

  // Sample plots
  const plots = [
    ["101", 7.62, 15.24, "North", "PLC", "Available"],
    ["102", 7.62, 15.24, "South", "Non PLC", "Available"],
    ["103", 9.14, 18.29, "East", "PLC", "Allotted"],
    ["104", 9.14, 18.29, "West", "Non PLC", "Available"],
    ["105", 12.19, 24.38, "North-East", "PLC", "Hold"],
    ["106", 12.19, 24.38, "North-West", "Non PLC", "Available"],
    ["107", 7.62, 15.24, "South-East", "PLC", "Freeze"],
    ["108", 9.14, 18.29, "South-West", "Non PLC", "Available"],
    ["109", 12.19, 24.38, "North", "PLC", "Available"],
    ["110", 7.62, 15.24, "East", "Non PLC", "Allotted"],
    ["201", 9.14, 18.29, "South", "PLC", "Available"],
    ["202", 12.19, 24.38, "North-East", "Non PLC", "Available"],
    ["203", 7.62, 15.24, "West", "PLC", "Hold"],
    ["204", 9.14, 18.29, "North", "Non PLC", "Available"],
    ["205", 12.19, 24.38, "South-West", "PLC", "Available"],
  ] as [string, number, number, string, string, string][];

  for (const [num, w, l, facing, plc, status] of plots) {
    const sq = (w * l).toFixed(2);
    const sqy = (w * l * 1.196).toFixed(2);
    await client.query(
      `INSERT INTO plots (plot_number, width_mtr, length_mtr, area_sq_mtr, area_sq_yrd, plot_facing, plc_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (plot_number) DO NOTHING`,
      [num, w, l, sq, sqy, facing, plc, status],
    );
  }

  await client.end();
  console.log("Seed complete!");
  console.log("CRM Login → admin@dreamvalley.com / admin123");
  console.log("Sales Login → RM001, RM002, RM003 (Active)");
}

seed().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
