// Example: projectfa.st-style share target (scaffold only — wire your backend)
import { createShareTargetRoute } from "@pamfilico/pwa-template/next";

export const { GET, POST } = createShareTargetRoute({
  isAuthenticated: async (request) => {
    return Boolean(request.cookies.get("next-auth.session-token"));
  },
  loginRedirect: (request, callbackPath) => {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", callbackPath);
    return url;
  },
  onCapture: async (request, payload) => {
    // TODO: stage files, call backend API
    console.log("shared", payload.sourceUrl, payload.files.length);
    return Response.redirect(new URL("/ideas", request.url));
  },
});
