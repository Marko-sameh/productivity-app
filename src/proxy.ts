import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/salary-review/:path*",
    "/work-entries/:path*",
    "/releases/:path*",
    "/settings/:path*",
    "/api/commits/:path*",
    "/api/deployments/:path*",
    "/api/impact/:path*",
    // "/api/upload/:path*",
    "/api/bitbucket/sync/:path*",
  ],
};
