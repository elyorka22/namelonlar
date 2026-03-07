import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        try {
          // Нормализуем email (убираем пробелы, приводим к нижнему регистру)
          const normalizedEmail = credentials.email.trim().toLowerCase();
          const providedPassword = credentials.password;
          
          console.log("[AUTH] Attempting login for:", normalizedEmail);
          console.log("[AUTH] Password length provided:", providedPassword.length);
          
          // Ищем пользователя (без учета регистра)
          let user;
          try {
            user = await prisma.user.findFirst({
              where: { 
                email: {
                  equals: normalizedEmail,
                  mode: 'insensitive'
                }
              },
            });
          } catch (dbError: any) {
            console.error("[AUTH] Database connection error:", dbError.message);
            // Если база данных недоступна, возвращаем null
            // NextAuth покажет стандартную ошибку
            if (dbError.message?.includes("Tenant or user not found") || 
                dbError.message?.includes("FATAL")) {
              console.error("[AUTH] Database authentication failed. Check DATABASE_URL in Vercel.");
            }
            return null;
          }

          if (!user) {
            console.log("[AUTH] User not found:", normalizedEmail);
            // Попробуем найти с оригинальным email (на случай пробелов)
            const userCaseSensitive = await prisma.user.findFirst({
              where: { 
                email: {
                  equals: credentials.email.trim(),
                  mode: 'insensitive'
                }
              },
            });
            
            if (!userCaseSensitive) {
              console.log("[AUTH] User not found even with original email");
              return null;
            }
            
            // Используем найденного пользователя
            const finalUser = userCaseSensitive;
            
            if (!finalUser.password) {
              console.log("[AUTH] User has no password:", finalUser.email);
              return null;
            }

            // Проверяем формат пароля
            const isBcryptFormat = finalUser.password.startsWith("$2") && finalUser.password.length === 60;
            if (!isBcryptFormat) {
              console.log("[AUTH] Password is not in bcrypt format:", finalUser.email);
              console.log("[AUTH] Password length:", finalUser.password.length);
              console.log("[AUTH] Password starts with:", finalUser.password.substring(0, 10));
              return null;
            }

            // Пробуем сравнить пароль (с разными вариантами)
            let isPasswordValid = await bcrypt.compare(credentials.password, finalUser.password);
            
            // Если не совпадает, пробуем с trimmed версией
            if (!isPasswordValid) {
              isPasswordValid = await bcrypt.compare(credentials.password.trim(), finalUser.password);
            }

            if (!isPasswordValid) {
              console.log("[AUTH] Invalid password for:", finalUser.email);
              console.log("[AUTH] Password provided length:", credentials.password.length);
              console.log("[AUTH] Password hash in DB length:", finalUser.password.length);
              console.log("[AUTH] Password hash prefix:", finalUser.password.substring(0, 15));
              return null;
            }

            console.log("[AUTH] ✅ Login successful for:", finalUser.email, "Role:", finalUser.role);
            return {
              id: finalUser.id,
              email: finalUser.email,
              name: finalUser.name,
              image: finalUser.image,
            };
          }

          if (!user.password) {
            console.log("[AUTH] User has no password:", user.email);
            return null;
          }

          // Проверяем формат пароля
          const isBcryptFormat = user.password.startsWith("$2") && user.password.length === 60;
          if (!isBcryptFormat) {
            console.log("[AUTH] Password is not in bcrypt format:", user.email);
            console.log("[AUTH] Password length:", user.password.length);
            console.log("[AUTH] Password starts with:", user.password.substring(0, 10));
            return null;
          }

          // Пробуем сравнить пароль
          let isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          // Если не совпадает, пробуем с trimmed версией
          if (!isPasswordValid) {
            isPasswordValid = await bcrypt.compare(credentials.password.trim(), user.password);
          }

          if (!isPasswordValid) {
            console.log("[AUTH] Invalid password for:", user.email);
            console.log("[AUTH] Password provided length:", credentials.password.length);
            console.log("[AUTH] Password hash in DB length:", user.password.length);
            console.log("[AUTH] Password hash prefix:", user.password.substring(0, 15));
            return null;
          }

          console.log("[AUTH] ✅ Login successful for:", user.email, "Role:", user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("[AUTH] Error in authorize:", error);
          if (error instanceof Error) {
            console.error("[AUTH] Error message:", error.message);
            console.error("[AUTH] Error stack:", error.stack);
          }
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // PrismaAdapter автоматически создаст пользователя, но проверим на ошибки
          if (!user.email) {
            console.error("Google OAuth: No email provided");
            return false;
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        console.log("[AUTH] JWT token updated for user:", user.id);
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        console.log("[AUTH] Session created for user:", token.id);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Убеждаемся, что redirect использует правильный baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
};

