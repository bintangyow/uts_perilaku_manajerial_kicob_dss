import "dotenv/config";
import { db } from "./index";
import { employees, departments, positions } from "./schema";
import { eq, isNull } from "drizzle-orm";

async function migrate() {
  console.log("🚀 Starting data migration...");

  // 1. Get all employees with text-based department/position
  const allEmployees = await db.select().from(employees);
  
  const uniqueDepartments = Array.from(new Set((allEmployees as any[]).map(e => e.department).filter(Boolean)));
  const uniquePositions = Array.from(new Set((allEmployees as any[]).map(e => e.position).filter(Boolean)));

  console.log(`Found ${uniqueDepartments.length} unique departments and ${uniquePositions.length} unique positions.`);

  // 2. Insert Departments
  const deptMap = new Map<string, number>();
  for (const deptName of uniqueDepartments) {
    const [inserted] = await db.insert(departments).values({ name: deptName! }).returning();
    deptMap.set(deptName!, inserted.id);
  }

  // 3. Insert Positions
  const posMap = new Map<string, number>();
  for (const posName of uniquePositions) {
    const [inserted] = await db.insert(positions).values({ name: posName! }).returning();
    posMap.set(posName!, inserted.id);
  }

  // 4. Update Employees
  console.log("Updating employee records...");
  for (const empRaw of allEmployees) {
    const emp = empRaw as any;
    const updates: any = {};
    if (emp.department && deptMap.has(emp.department)) {
      updates.departmentId = deptMap.get(emp.department);
    }
    if (emp.position && posMap.has(emp.position)) {
      updates.positionId = posMap.get(emp.position);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(employees).set(updates).where(eq(employees.id, emp.id));
    }
  }

  console.log("✅ Migration completed successfully!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
