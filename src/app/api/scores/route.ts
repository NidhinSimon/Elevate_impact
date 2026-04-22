import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { score, date } = await req.json();

    // 1. Validate score
    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });
    }

    // 2. Validate date
    const scoreDate = new Date(date);
    if (scoreDate > new Date()) {
      return NextResponse.json({ error: "Score date cannot be in the future" }, { status: 400 });
    }

    // 3. Check duplicate
    const { count: duplicateCount } = await supabase
      .from("scores")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .eq("score_date", date);

    if (duplicateCount && duplicateCount > 0) {
      return NextResponse.json({ error: "A score already exists for this date. Please edit the existing entry." }, { status: 409 });
    }

    // 4. Check count and rolling logic
    const { data: existingScores } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .order("score_date", { ascending: true });

    if (existingScores && existingScores.length >= 5) {
      await supabase.from("scores").delete().eq("id", existingScores[0].id);
    }

    // 5. Insert
    const { data, error } = await supabase
      .from("scores")
      .insert({
        user_id: user.id,
        score_value: score,
        score_date: date,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, score, date } = await req.json();

    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });
    }

    const { count: duplicateCount } = await supabase
      .from("scores")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .eq("score_date", date)
      .neq("id", id);

    if (duplicateCount && duplicateCount > 0) {
      return NextResponse.json({ error: "A score already exists for this date." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("scores")
      .update({ score_value: score, score_date: date })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
