"use client";
import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    async function processOAuthCallback() {
      try {
        await handleRedirectCallback({
          redirectUrl: window.location.origin + "/sso-callback",
          afterSignInUrl: "/",
          afterSignUpUrl: "/"
        });
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.push("/");
      }
    }
    processOAuthCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-lg">Completing authentication...</p>
    </div>
  );
}