import bcrypt from "bcryptjs";
import clientPromise from '../mongodb';
import { NextResponse } from "next/server";

export async function POST(req: Request, res: NextResponse) {
  try {
    const { email, password, companyName } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('EcoVerify'); 

    // Check if user already exists
    const existingUser = await db.collection("Users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.collection("Users").insertOne({
      email,
      password: hashedPassword,
      companyName,
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
