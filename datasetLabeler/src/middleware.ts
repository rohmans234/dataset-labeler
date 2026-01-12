import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Jika user SUDAH login dan mencoba buka halaman /login, 
    // alihkan mereka ke /dashboard agar tidak login dua kali.
    if (path === "/login" && !!token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Proteksi Role Admin: Jika ke /admin tapi bukan ADMIN, lempar ke dashboard.
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // PENTING: Function ini menentukan rute mana yang butuh login.
      // Kita harus mengembalikan 'true' untuk halaman login agar tidak terjadi loop redirect.
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Izinkan akses tanpa token HANYA untuk halaman /login
        if (path === "/login") return true;
        // Untuk rute lain (dashboard, admin), wajib ada token
        return !!token;
      },
    },
  }
);

export const config = {
  // Pantau rute dashboard, admin, dan login
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};