import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export type VersionInfo = {
  version: string;
  timestamp: string;
  commit?: string;
  branch?: string;
};

export type CreateVersionRouteOptions = {
  versionJsonPath?: string;
  fallbackVersion?: string;
};

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export function createVersionRoute(options: CreateVersionRouteOptions = {}) {
  const versionJsonPath =
    options.versionJsonPath ?? path.join(process.cwd(), "public", "version.json");

  return async function GET() {
    try {
      if (fs.existsSync(versionJsonPath)) {
        const versionData = JSON.parse(
          fs.readFileSync(versionJsonPath, "utf8"),
        ) as VersionInfo;
        return NextResponse.json(versionData, { headers: NO_CACHE_HEADERS });
      }

      const version =
        process.env.NEXT_PUBLIC_APP_VERSION ??
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.CI_COMMIT_SHA ??
        options.fallbackVersion ??
        "dev";

      return NextResponse.json(
        {
          version,
          timestamp: new Date().toISOString(),
          commit:
            process.env.VERCEL_GIT_COMMIT_SHA ??
            process.env.CI_COMMIT_SHA ??
            "unknown",
          branch:
            process.env.VERCEL_GIT_COMMIT_REF ??
            process.env.CI_COMMIT_BRANCH ??
            "unknown",
        } satisfies VersionInfo,
        { headers: NO_CACHE_HEADERS },
      );
    } catch (error) {
      console.error("[pwa-template] version route error:", error);
      return NextResponse.json(
        { version: "unknown", error: "Failed to get version" },
        { status: 500 },
      );
    }
  };
}
