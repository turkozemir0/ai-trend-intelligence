import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const submissionSchema = z.object({
  name: z.string().min(2).max(100),
  website: z.string().url(),
  description: z.string().min(10).max(500),
  category: z.string().min(2),
  submitter_email: z.string().email(),
  company_fax: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.company_fax) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const validatedData = submissionSchema.parse(body);

    const { data: existing } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("website", validatedData.website)
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json(
        { ok: false, message: "This tool has already been submitted and is pending review." },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin.from("submissions").insert({
      name: validatedData.name,
      website: validatedData.website,
      description: validatedData.description,
      category: validatedData.category,
      submitter_email: validatedData.submitter_email,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: "Submitted! We will review within 48 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Submission error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
