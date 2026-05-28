import { NextRequest, NextResponse } from "next/server";
import {
  buildShareTargetRedirectParams,
  parseShareTargetFormData,
  type ParsedSharePayload,
} from "../lib/share-target.js";

export type ShareTargetRouteOptions = {
  /** Build login URL when session is missing */
  loginRedirect: (request: NextRequest, callbackPath: string) => URL;
  /** Return true when user is authenticated */
  isAuthenticated: (request: NextRequest) => Promise<boolean> | boolean;
  /** Handle authenticated capture (files, URLs, text) */
  onCapture: (
    request: NextRequest,
    payload: ParsedSharePayload,
  ) => Promise<NextResponse>;
  /** Optional pending cookie name for unauthenticated shares */
  pendingCookieName?: string;
  /** Redirect path for text/url-only shares after auth */
  capturePath?: (locale: string, params: URLSearchParams) => string;
  defaultLocale?: string;
};

export function createShareTargetRoute(options: ShareTargetRouteOptions) {
  const pendingCookie = options.pendingCookieName ?? "pwaSharePending";
  const defaultLocale = options.defaultLocale ?? "en";

  async function POST(request: NextRequest) {
    const formData = await request.formData();
    const payload = await parseShareTargetFormData(formData);
    const params = buildShareTargetRedirectParams(payload);
    const authenticated = await options.isAuthenticated(request);

    if (!authenticated) {
      const capturePath =
        options.capturePath?.(defaultLocale, params) ??
        `/${defaultLocale}/shared/capture?${params.toString()}`;
      const loginUrl = options.loginRedirect(request, capturePath);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(pendingCookie, JSON.stringify(payload), {
        httpOnly: false,
        maxAge: 600,
        path: "/",
      });
      return response;
    }

    return options.onCapture(request, payload);
  }

  async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url") ?? "";
    const title = request.nextUrl.searchParams.get("title") ?? "";
    const text = request.nextUrl.searchParams.get("text") ?? "";
    const payload = {
      title,
      text,
      url,
      sourceUrl: url,
      files: [],
    } satisfies ParsedSharePayload;

    const authenticated = await options.isAuthenticated(request);
    if (!authenticated) {
      const params = buildShareTargetRedirectParams(payload);
      const capturePath =
        options.capturePath?.(defaultLocale, params) ??
        `/${defaultLocale}/shared/capture?${params.toString()}`;
      return NextResponse.redirect(options.loginRedirect(request, capturePath));
    }

    return options.onCapture(request, payload);
  }

  return { POST, GET };
}
