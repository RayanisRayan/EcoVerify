import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "../mongodb";

export async function GET(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const company = searchParams.get("company");
  
      if (!company) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        );
      }
  
      const client = await clientPromise;
      const db = client.db("EcoVerify");
      const usersCollection = db.collection("Users");
  
      // Find the user by company name
      const user = await usersCollection.findOne({ companyName: company });
  
      if (!user || !user.devices) {
        return NextResponse.json({ error: "No devices found" });
      }
  
      return NextResponse.json({ devices: user.devices });
    } catch (error) {
      return NextResponse.json({
        error: "Internal Server Error",
        details: error,
      });
    }
  }
  