import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

/**
 * Next.js 16 renamed Middleware to Proxy; this file does three jobs:
 *
 *  1. Keeps the Supabase auth cookies fresh for the admin panel and blocks
 *     /admin for signed-out visitors before the page renders.
 *  2. Serves the default language (Bangla) WITHOUT a URL prefix — the original
 *     drarifortho.com links (`/about-us`, `/our-treatments/...`) keep working —
 *     by rewriting them internally to the `/bn/...` route.
 *  3. Redirects `/bn/...` to the canonical unprefixed URL, so each page has one
 *     address. English stays under `/en/...`.
 */

const PUBLIC_FILE = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|txt|xml|json|css|js|woff2?|ttf|mp4|webm|pdf)$/i;

function isBypassed(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isBypassed(pathname)) return NextResponse.next();

  // ------------------------------------------------------------- admin area
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

  // ------------------------------------------------------- locale handling
  const [, first, ...rest] = pathname.split("/");

  if (isLocale(first)) {
    if (first === DEFAULT_LOCALE) {
      // Canonicalise: /bn/about-us -> /about-us
      const target = new URL(`/${rest.join("/")}${search}`, request.url);
      return NextResponse.redirect(target, 308);
    }
    return NextResponse.next();
  }

  // Unprefixed URL: render the default locale without changing the address.
  const rewritten = new URL(
    `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}${search}`,
    request.url,
  );
  return NextResponse.rewrite(rewritten);
}

/**
 * `NextResponse.redirect` builds a fresh response, so any auth cookies that
 * Supabase refreshed on the way through are dropped unless they are copied
 * across — which would sign the user out again on the very next request.
 */
function redirectWith(url: URL, carrying: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of carrying.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

/**
 * Optimistic auth check. The real authorisation (active profile, admin role)
 * still happens in the admin layout and in every Server Action — this only
 * saves a signed-out visitor from loading the dashboard shell.
 */
async function guardAdmin(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without configuration the admin panel shows its own setup screen.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname.startsWith("/admin/login");

  // The logout handler must run even for signed-in users.
  if (pathname.startsWith("/admin/logout")) return response;

  if (!user && !isLoginRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWith(loginUrl, response);
  }

  if (user && isLoginRoute) {
    return redirectWith(new URL("/admin", request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static assets. Locale rewrites and
     * the admin guard both need to see the original path.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
