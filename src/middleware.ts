import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=(), fullscreen=(self)",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
  "X-Powered-By": "",
};

function buildCsp(nonce: string): string {
  if (!IS_PRODUCTION) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com wss://*",
      "media-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; ");
  }

  return [
    "default-src 'self'",
    `script-src 'strict-dynamic' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com https://*.ingest.sentry.io https://www.google-analytics.com https://www.googletagmanager.com wss://*",
    "media-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (value) {
      response.headers.set(key, value);
    } else {
      response.headers.delete(key);
    }
  }

  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    { source: "/((?!api/|_next/|_static|_vercel|favicon|robots|sitemap).*)", missing: [{ type: "header", key: "next-router-prefetch" }, { type: "header", key: "purpose", value: "prefetch" }] },
  ],
};
