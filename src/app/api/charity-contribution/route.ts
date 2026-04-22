import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { charityId, percentage } = await req.json();

    if (percentage < 10) {
      return NextResponse.json({ error: "Minimum charity contribution is 10%" }, { status: 400 });
    }

    if (percentage > 100) {
      return NextResponse.json({ error: "Maximum charity contribution is 100%" }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        selected_charity_id: charityId,
        charity_contribution_percentage: percentage
      })
      .eq("id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
