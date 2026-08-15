import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "kysely";

const PLAN_LIMITS: Record<string, number> = {
  free: 20,
  plus: -1,
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await db
      .selectFrom("user")
      .select("plan")
      .where("id", "=", session.user.id)
      .executeTakeFirst();

    const plan = (row?.plan as string) || "free";
    const limit = PLAN_LIMITS[plan] ?? 20;

    if (limit < 0) {
      return NextResponse.json({ plan, usedToday: 0, limitToday: -1, remaining: -1 });
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const usage = await db
      .selectFrom("user_daily_usage")
      .select("count")
      .where("userId", "=", session.user.id)
      .where("date", "=", sql<Date>`${dateStr}::date`)
      .executeTakeFirst();

    const usedToday = usage?.count ?? 0;

    return NextResponse.json({
      plan,
      usedToday,
      limitToday: limit,
      remaining: Math.max(0, limit - usedToday),
    });
  } catch (err) {
    console.error("Usage GET error:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
