import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const REGION = process.env.AWS_REGION || "us-east-1";

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function extractExpression(source, exportName) {
  const pattern = new RegExp(`export const ${exportName}(?::[\\s\\S]*?)? = ([\\s\\S]*?);\\n`, "m");
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Could not find export ${exportName}`);
  }
  return match[1].replace(/\s+as const/g, "");
}

function evaluateExpression(expression) {
  return vm.runInNewContext(`(${expression})`, {}, { timeout: 1000 });
}

function marshall(value) {
  if (value === null) {
    return { NULL: true };
  }
  if (typeof value === "string") {
    return { S: value };
  }
  if (typeof value === "number") {
    return { N: String(value) };
  }
  if (typeof value === "boolean") {
    return { BOOL: value };
  }
  if (Array.isArray(value)) {
    return { L: value.map((entry) => marshall(entry)) };
  }
  if (typeof value === "object") {
    const members = {};
    for (const [key, entry] of Object.entries(value)) {
      members[key] = marshall(entry);
    }
    return { M: members };
  }
  throw new Error(`Unsupported value type: ${typeof value}`);
}

function writeTempJson(payload) {
  const filePath = path.join(os.tmpdir(), `circular-os-seed-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload));
  return filePath;
}

function runAws(args, payload) {
  const tempPath = writeTempJson(payload);
  try {
    execFileSync("aws", [...args, `file://${tempPath}`], {
      stdio: "inherit",
      env: { ...process.env, AWS_REGION: REGION },
    });
  } finally {
    fs.unlinkSync(tempPath);
  }
}

function batchWrite(tableName, items) {
  for (let index = 0; index < items.length; index += 25) {
    const chunk = items.slice(index, index + 25).map((item) => ({
      PutRequest: { Item: marshall(item).M },
    }));
    runAws(["dynamodb", "batch-write-item", "--request-items"], {
      [tableName]: chunk,
    });
  }
}

function putItem(tableName, item) {
  runAws(["dynamodb", "put-item", "--table-name", tableName, "--item"], marshall(item).M);
}

function loadCatalogProducts() {
  const source = readFile("frontend/customer/src/data/products.ts");
  return evaluateExpression(extractExpression(source, "PRODUCTS"));
}

function loadOperationsSnapshot() {
  const source = readFile("frontend/ops-dashboard/data/operations-data.ts");
  return evaluateExpression(extractExpression(source, "operationsData"));
}

function loadExecutiveSnapshot() {
  const source = readFile("frontend/executive-dashboard/data/executive-impact.ts");
  return evaluateExpression(extractExpression(source, "executiveDashboardData"));
}

function loadSellerAnalytics() {
  const source = readFile("frontend/seller-dashboard/data/seller-analytics.ts");
  return evaluateExpression(extractExpression(source, "sellerAnalytics"));
}

function seedCatalog() {
  const products = loadCatalogProducts();
  batchWrite("CircularOS-ProductCatalog", products);
}

function seedOperations() {
  putItem("CircularOS-OperationsSnapshots", {
    snapshotId: "default",
    data: loadOperationsSnapshot(),
    updatedAt: new Date().toISOString(),
  });
}

function seedExecutive() {
  putItem("CircularOS-ExecutiveSnapshots", {
    snapshotId: "default",
    data: loadExecutiveSnapshot(),
    updatedAt: new Date().toISOString(),
  });
}

function seedSeller() {
  putItem("CircularOS-SellerAnalytics", {
    sellerId: "SELLER-NORTHSTAR-01",
    data: loadSellerAnalytics(),
    updatedAt: new Date().toISOString(),
  });
}

function validateFixtures() {
  const products = loadCatalogProducts();
  const operations = loadOperationsSnapshot();
  const executive = loadExecutiveSnapshot();
  const seller = loadSellerAnalytics();

  console.log(JSON.stringify({
    catalogProducts: products.length,
    catalogFirstProduct: products[0]?.product_id ?? null,
    operationsFacility: operations.facility,
    executivePeriod: executive.reportingPeriod,
    sellerName: seller.sellerName,
  }, null, 2));
}

const targets = {
  catalog: seedCatalog,
  operations: seedOperations,
  executive: seedExecutive,
  seller: seedSeller,
  validate: validateFixtures,
  all() {
    seedCatalog();
    seedOperations();
    seedExecutive();
    seedSeller();
  },
};

const target = process.argv[2] || "all";

if (!(target in targets)) {
  console.error(`Unknown seed target "${target}". Use one of: ${Object.keys(targets).join(", ")}`);
  process.exit(1);
}

targets[target]();
