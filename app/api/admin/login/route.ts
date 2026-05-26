import { NextRequest, NextResponse } from "next/server";

const ADMINS = [
  { username: "Olalekan123", password: "Collins@081", role: "CEO" },
  { username: "Abiodun123", password: "Hyberbole1@081", role: "Customer Care Specialist" },
  { username: "Abeeb123", password: "Daredevil@081", role: "Artisan Specialist" },
  { username: "Ayomide123", password: "Peacebeuntoyou@081", role: "Account Specialist" }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const admin = ADMINS.find(a => a.username === username && a.password === password);

    if (admin) {
      return NextResponse.json({
        success: true,
        admin: { username: admin.username, role: admin.role }
      });
    } else {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}