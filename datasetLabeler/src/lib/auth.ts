import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sheets } from "./google";

// 1. Perbaikan Type Augmentation agar TypeScript mengenali properti 'role'
declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
        
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'users!A2:D', // Kolom: A=Email, B=Password, C=Role, D=Name
          });

          const rows = response.data.values || [];
          
          // 2. Cari user dan pastikan perbandingan string aman
          const userRow = rows.find(row => 
            row[0]?.trim() === credentials.email?.trim() && 
            row[1]?.trim() === credentials.password?.trim()
          );

          if (userRow) {
            // 3. Pastikan ROLE dikirim dalam format UPPERCASE (ADMIN/USER)
            // agar cocok dengan pengecekan di middleware.ts
            return { 
              id: userRow[0], 
              email: userRow[0], 
              role: userRow[2]?.toUpperCase().trim() || "USER",
              name: userRow[3] || userRow[0].split('@')[0], 
            };
          }
          return null;
        } catch (error) {
          console.error("Auth Error (Sheets API):", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    // 4. Teruskan role dari user object ke token JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // 5. Teruskan role dari token JWT ke session agar bisa diakses di client-side
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', 
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Sesi berlaku 1 hari
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);