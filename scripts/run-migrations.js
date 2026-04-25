const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");
const prismaSchemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

const migrationFiles = fs
  .readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(migrationsDir, entry.name, "migration.sql"))
  .filter((filePath) => fs.existsSync(filePath))
  .sort((a, b) => a.localeCompare(b));

if (migrationFiles.length === 0) {
  console.log("No migration files found.");
  process.exit(0);
}

for (const filePath of migrationFiles) {
  const label = path.basename(path.dirname(filePath));
  console.log(`Applying ${label}...`);

  const command =
    process.platform === "win32"
      ? `cmd /c npx prisma db execute --schema "${prismaSchemaPath}" --file "${filePath}"`
      : `npx prisma db execute --schema "${prismaSchemaPath}" --file "${filePath}"`;

  execSync(command, {
    stdio: "inherit",
    cwd: path.join(__dirname, "..")
  });
}

console.log("All migrations applied successfully.");
