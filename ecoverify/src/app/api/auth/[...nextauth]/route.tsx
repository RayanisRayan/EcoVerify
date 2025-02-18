import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  debug: true,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        console.log("111");
        let db;
        try {
          const client = await clientPromise;
          db = client.db('EcoVerify');
        } catch (error) {
          console.error("Database connection failed:", error);
          throw new Error("Database connection failed");
        }

        console.log(credentials.email);
        // Find user by emai
   
        const user = await db.collection("Users").findOne({
          email: credentials.email,
        });
        console.log(user);
        if (!user) {
          throw new Error("User not found");
        }
        console.log(user);
        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        console.log(user);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // Return the user object
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.companyName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const, // This is the correct type assignment for JWT sessions
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Redirect to a custom login page on failed login
    error: "/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
