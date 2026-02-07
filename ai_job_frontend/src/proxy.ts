import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  /**
   * Normalize pathname: strip trailing slashes so "/about" and "/about/" match the same.
   * This must run first so public path detection is reliable.
   */
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  /**
   * Path Logic Definitions (checked BEFORE any auth call).
   * Public paths: Accessible without login (Landing, About, Login, Signup).
   * Onboarding paths: Specific setup pages for new users.
   */
  const isPublicPath =
    normalizedPath === "/" ||
    normalizedPath === "/about" ||
    normalizedPath.startsWith("/about/") ||
    normalizedPath.startsWith("/auth");
  const isOnboardingPath =
    normalizedPath.startsWith("/preferences") || normalizedPath.startsWith("/setup");
  const isApiPath = normalizedPath.startsWith("/api");

  /**
   * RULE 0: Always-public paths — allow immediately without touching Supabase.
   * /about and /auth/callback are allowed without auth check.
   * /auth/login and /auth/register are NOT included so we can redirect logged-in users away.
   */
  const isAlwaysPublicPath =
    normalizedPath === "/about" ||
    normalizedPath.startsWith("/about/") ||
    normalizedPath === "/auth/callback" ||
    normalizedPath.startsWith("/auth/callback/");
  if (isAlwaysPublicPath) {
    return NextResponse.next({
      request: { headers: req.headers },
    });
  }

  /**
   * Initialize the response object for non-public routes.
   */
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  /**
   * Create a Supabase client configured for Server-Side Rendering (SSR).
   * The 'cookies' object manages the syncing of authentication tokens 
   * between the incoming request and the outgoing response.
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res = NextResponse.next({
              request: { headers: req.headers },
            });
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /**
   * Re-validate the user's session.
   * Using 'getUser()' instead of 'getSession()' is a security best practice 
   * as it verifies the user's ID with the Supabase Auth server.
   */
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  /**
   * Check user metadata for onboarding status.
   */
  const hasCompletedOnboarding = user?.user_metadata?.onboarded === true;

  // --- ACCESS CONTROL & REDIRECT LOGIC (non-public only) ---

  /**
   * RULE 1: Authentication Guard.
   * If the user is NOT logged in and attempts to access any non-public page,
   * redirect them to login. Public paths (e.g. "/" home, /auth/login, /auth/register) are allowed without login.
   */
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  /**
   * RULE 1b: Logged-in users must not access login or register pages.
   * Redirect them to dashboard (or preferences if onboarding not done).
   */
  const isAuthLoginOrRegister =
    normalizedPath === "/auth/login" || normalizedPath === "/auth/register";
  if (isLoggedIn && isAuthLoginOrRegister) {
    const target = hasCompletedOnboarding ? "/dashboard" : "/preferences";
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  /**
   * RULE 2: Onboarding Gate.
   * Logged-in users who haven't completed onboarding are forced to finish it
   * before accessing any authenticated pages (excluding APIs).
   */
  if (isLoggedIn && !hasCompletedOnboarding && !isPublicPath && !isOnboardingPath && !isApiPath) {
    return NextResponse.redirect(new URL("/preferences", nextUrl));
  }

  /**
   * RULE 3: Intelligent Landing Page Redirect.
   * If a logged-in user hits the home page, send them to their dashboard 
   * or the setup page based on their onboarding status.
   */
  if (isLoggedIn && normalizedPath === "/") {
    const target = hasCompletedOnboarding ? "/dashboard" : "/preferences";
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  return res;
}

/**
 * Middleware Matcher Configuration.
 * This "Negative Matcher" runs the middleware on all routes EXCEPT:
 * 1. Internal Next.js static files and images.
 * 2. Static assets in the public folder (favicons, svgs, common image formats).
 */
export const config = {
  matcher: [
    // Skip static assets AND the auth callback path so Supabase can finish OAuth without middleware interference
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};