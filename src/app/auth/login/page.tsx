"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/_components/main/Logo";
import { supabaseClient } from "@/_lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    // Ensure the session cookie is written before navigating
    await supabaseClient.auth.getSession();

    if (error) {
      setLoading(false);
      alert(error.message || "Login failed");
      return;
    }

    try {
      await fetch("/api/profile-sync", { method: "POST" });
    } catch (e) {
      console.warn("Profile sync failed:", e);
    }

    setLoading(false);
    // Let middleware route based on onboarding status
    router.push("/");
    router.refresh();
  }

  const handleGoogleLogin = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Dynamically sets the return path based on your current URL
        redirectTo: `${window.location.origin}/auth/callback`,
       // Forces Google to show the account selection screen every time
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });
  
    if (error) {
      console.error("Login error:", error.message);
    }
  };

  const handleLinkedInLogin = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      // 1. Updated to match the OIDC setting in your screenshot
      provider: 'linkedin_oidc', 
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // 2. This enables the account selection screen for LinkedIn
          prompt: 'select_account', 
        },
      },
    });
  
    if (error) {
      console.error("LinkedIn login error:", error.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-12">
        <div>
          {/* Logo */}
          <div className="mb-16">
            <Logo />
          </div>

          {/* Headlines */}
          <div className="space-y-4 mb-8">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Apply to jobs in 1-click.
            </h1>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Power your entire job search,
            </h2>
            <h3 className="text-5xl font-bold text-white leading-tight">
              with our recruiter-approved AI.
            </h3>
          </div>

          {/* Sub-headline */}
          <p className="text-lg text-gray-200 mb-12">
            Browse handpicked jobs from the best companies.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"
                />
              ))}
            </div>
            <p className="text-gray-200 font-medium">
              Trusted by 1+ job seekers so far
            </p>
          </div>

          {/* Company Logos Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              "Airbnb",
              "Notion",
              "Spotify",
              "Stripe",
              "Slack",
              "VISA",
              "NETFLIX",
              "OpenAI",
            ].map((company) => (
              <div
                key={company}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center h-16"
              >
                <span className="text-xs font-semibold text-gray-700">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-800 p-8">
        <div className="w-full max-w-md">
          {/* Logo - Centered */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Login to your account.
          </h1>

          {/* Login Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Address"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                suppressHydrationWarning
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 pr-12 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  suppressHydrationWarning
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

            {/* Remember Device Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="text-sm text-white flex items-center gap-1"
              >
                Remember this device
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#00D9FF] px-4 py-3 text-white font-semibold hover:bg-[#00C8E6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Registration Link */}
          <p className="mt-6 text-center text-sm text-gray-300">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Register.
            </Link>
          </p>

          {/* Separator */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-gray-500">Or log in with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button" // חשוב כדי שלא יגיש את הטופס בטעות
              onClick={handleGoogleLogin}
              className="group w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-400 active:scale-[0.98]"
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
              <span>Continue with Google</span>
            </button>

            {/* LinkedIn Button */}
            <button
              type="button"
              onClick={handleLinkedInLogin}
              className="group w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-400 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>Continue with LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
