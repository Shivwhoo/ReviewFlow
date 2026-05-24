import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import { z } from "zod";

const customTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name cannot be empty"),
  emoji: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

const customTagsSchema = z.object({
  customTags: z.array(customTagSchema)
    .refine((tags) => {
      const activeTags = tags.filter((t) => t.isActive !== false);
      return activeTags.length <= 8;
    }, "You can define a maximum of 8 active tags")
    .refine((tags) => {
      const activeTags = tags.filter((t) => t.isActive !== false);
      const names = activeTags.map((t) => t.name.toLowerCase().trim());
      return names.length === new Set(names).size;
    }, "Active tag names must be unique"),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = customTagsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    business.customTags = parsed.data.customTags;
    await business.save();

    return NextResponse.json({ customTags: business.customTags });
  } catch (error) {
    console.error("[PUT /api/business/tags]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
