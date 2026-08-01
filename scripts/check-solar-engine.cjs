const fs = require("fs");
const ts = require("typescript");

require.extensions[".ts"] = function compileTypescript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  module._compile(output, filename);
};

const { runSolarParityScenarios } = require("../src/features/solar/parityScenarios.ts");

const results = runSolarParityScenarios();
const failed = results.filter((result) => !result.passed);

for (const result of results) {
  const status = result.passed ? "PASS" : "FAIL";
  console.log(`${status} ${result.name}`);
  for (const error of result.errors) console.log(`  - ${error}`);
}

if (failed.length) {
  process.exitCode = 1;
}
