import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: scores, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(scores);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { score, date } = await request.json();

  if (!score || !date) {
    return NextResponse.json({ error: "Score and date are required" }, { status: 400 });
  }

  if (score < 1 || score > 45) {
    return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });
  }

  // Check for duplicate date
  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .single();

  if (existing) {
    return NextResponse.json({ error: "A score for this date already exists" }, { status: 400 });
  }

  // Get current scores count
  const { data: scores, error: fetchError } = await supabase
    .from("scores")
    .select("id, date")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // If 5 or more scores, delete the oldest
  if (scores.length >= 5) {
    const oldest = scores[0];
    await supabase.from("scores").delete().eq("id", oldest.id);
  }

  const { data, error } = await supabase
    .from("scores")
    .insert([{ user_id: user.id, score, date }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, score, date } = await request.json();

  if (!id || !score || !date) {
    return NextResponse.json({ error: "ID, score and date are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("scores")
    .update({ score, date })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
