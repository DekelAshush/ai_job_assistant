import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  /**
   * Initialize the response object. 
   * We pass the request headers forward to ensure consistency across the request lifecycle.
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
   * This determines if the user has completed their profile setup.
   */
  const hasCompletedOnboarding = user?.user_metadata?.onboarded === true;

  /**
   * Path Logic Definitions.
   * Public paths: Accessible without login (Landing page, Login, Signup).
   * Onboarding paths: Specific setup pages for new users.
   */
  const isPublicPath = pathname === "/" || pathname.startsWith("/auth");
  const isOnboardingPath = pathname.startsWith("/preferences") || pathname.startsWith("/setup");
  const isApiPath = pathname.startsWith("/api");

  // --- ACCESS CONTROL & REDIRECT LOGIC ---

  /**
   * RULE 1: Authentication Guard.
   * If the user is NOT logged in and attempts to access any non-public page 
   * (including routes in the '(dashboard)' group), redirect them to login.
   */
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
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
  if (isLoggedIn && pathname === "/") {
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