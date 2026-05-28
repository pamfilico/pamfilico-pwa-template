const fs = require("fs");
const path = require("path");

const version =
  process.env.NEXT_PUBLIC_APP_VERSION ||
  process.env.CI_COMMIT_SHA ||
  `dev-${Date.now()}`;

const cachePrefix =
  process.env.PWA_CACHE_PREFIX ||
  process.env.npm_package_name?.replace(/[^a-z0-9]/gi, "") ||
  "pamfilico-app";

const publicDir = path.join(process.cwd(), "public");
const templatePath = path.join(publicDir, "sw.template.js");
const outputPath = path.join(publicDir, "sw.js");

if (!fs.existsSync(templatePath)) {
  console.error(
    "❌ [pwa-template] Missing public/sw.template.js — copy from @pamfilico/pwa-template/templates/sw.template.js",
  );
  process.exit(1);
}

let swContent = fs.readFileSync(templatePath, "utf8");
swContent = swContent
  .replace(/\{\{APP_VERSION\}\}/g, version)
  .replace(/\{\{CACHE_PREFIX\}\}/g, cachePrefix);

fs.writeFileSync(outputPath, swContent);

const versionJson = {
  version,
  timestamp: new Date().toISOString(),
  commit: process.env.CI_COMMIT_SHA || "local",
  branch: process.env.CI_COMMIT_BRANCH || "local",
};

fs.writeFileSync(
  path.join(publicDir, "version.json"),
  JSON.stringify(versionJson, null, 2),
);

console.log(`✅ [pwa-template] Service worker version: ${version}`);
