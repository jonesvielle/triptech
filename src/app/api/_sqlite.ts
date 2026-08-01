import { spawnSync } from "child_process";
import path from "path";

type SqlitePayload = Record<string, unknown>;

const projectRoot = process.cwd();
const sqliteScript = path.join(projectRoot, "scripts", "sqlite_backend.py");

export function runSqliteCommand(command: string, payload: SqlitePayload = {}) {
  const result = spawnSync(
    "py",
    ["-3", sqliteScript, command, JSON.stringify(payload)],
    {
      cwd: projectRoot,
      encoding: "utf8",
      windowsHide: true,
    }
  );

  if (result.error) {
    throw result.error;
  }

  const output = (result.stdout || "").trim();
  const errorOutput = (result.stderr || "").trim();

  if (result.status !== 0) {
    throw new Error(output || errorOutput || "SQLite command failed.");
  }

  const parsed = output ? JSON.parse(output) : {};
  if (parsed?.error) {
    throw new Error(parsed.error);
  }

  return parsed;
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: unknown, status = 500) {
  return Response.json(
    {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    },
    { status }
  );
}
