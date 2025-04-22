import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: [
    "/",
    "/auth",          // Allow access to the auth page
    "/auth/(.*)",     // Allow all routes under auth
    "/api/webhook",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
    "/api/webhooks(.*)"
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next|.+..+)(.*)",
    "/api/webhooks(.*)"
  ],
  debug: true // Enable debug mode to see detailed logs
});
 
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};