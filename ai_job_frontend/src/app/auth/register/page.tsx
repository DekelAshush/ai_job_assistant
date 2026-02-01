"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/_components/main/Logo";
import { registerUserAction } from "@/_lib/actions";
import { supabaseClient } from "@/_lib/supabaseClient";

export default function AuthPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });
    if (error) alert(error.message || "Google login failed");
  };


  const handleLinkedInLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message || "LinkedIn login failed");
    }
  };

  /**
   * Handles the multi-step registration process:
   * 1. Creates user in Supabase via Server Action.
   * 2. Waits for DB propagation.
   * 3. Authenticates via Supabase Auth.
   */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Trigger Server Action to create user and profile in Supabase
      const result = await registerUserAction({
        email,
        password,
        firstName,
        lastName,
      });

      // Handle server-side validation or DB errors
      if (!result.success) {
        // Email already exists → redirect to login
        if (result.error?.includes("already been registered")) {
          alert("This email is already registered. Please log in.");
          window.location.href = "/auth/login";
          return;
        }

        throw new Error(result.error || "Registration failed");
      }


      // 2. Add a short delay (1000ms) to allow Supabase Auth to propagate
      // This prevents "Invalid Credentials" errors immediately after creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Authenticate the user using Supabase credentials
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Supabase Auth Error:", signInError.message);
        throw new Error(`Authentication failed: ${signInError.message}`);
      }

      // 4. On Success, land on home and let middleware route (dashboard vs prefs)
      window.location.href = "/";

    } catch (error: any) {
      console.error("Registration flow error:", error);
      alert(error.message || "An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-12">
        <div>
          <div className="mb-16">
            <Logo />
          </div>

          <div className="space-y-4 mb-8">
            <h1 className="text-5xl font-bold text-white leading-tight">Apply to jobs in 1-click.</h1>
            <h2 className="text-5xl font-bold text-white leading-tight">Power your entire job search,</h2>
            <h3 className="text-5xl font-bold text-white leading-tight">with our recruiter-approved AI.</h3>
          </div>

          <p className="text-lg text-gray-200 mb-12">Browse handpicked jobs from the best companies.</p>

          <div className="flex items-center gap-3 mb-12">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 border-2 border-white" />
              ))}
            </div>
            <p className="text-gray-200 font-medium">Trusted by 1+ job seekers so far</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {["Airbnb", "Notion", "Spotify", "Stripe", "Slack", "VISA", "NETFLIX", "OpenAI"].map((company) => (
              <div key={company} className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center h-16">
                <span className="text-xs font-semibold text-gray-700">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-800 p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <h1 className="text-3xl font-bold text-white mb-8 text-center">Sign up for an account</h1>

          <form onSubmit={handleRegister} className="space-y-5" suppressHydrationWarning>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First name"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Last name"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 pr-12 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-5-9-5s1.642-2.152 4.313-3.78M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1L4 4m0 0l4 4m-4-4l4 4m12 0l-2.1-2.1m2.1 2.1l-2.1-2.1m0 0L7.76 16.24" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="terms" className="text-xs text-gray-300 leading-tight">
                By signing up you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#00D9FF] px-4 py-3 text-white font-semibold hover:bg-[#00C8E6] transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register Now"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>.
          </p>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleLinkedInLogin}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V22H.24zM8.44 8.25h4.33v1.87h.06c.6-1.14 2.06-2.35 4.24-2.35 4.53 0 5.36 2.98 5.36 6.86V22h-4.52v-5.82c0-1.39-.03-3.17-1.93-3.17-1.93 0-2.22 1.51-2.22 3.07V22H8.44z" />
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}