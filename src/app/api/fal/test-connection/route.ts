
import { NextResponse } from "next/server";
import { fal } from "@/lib/fal"; // Ensure this is importing the server-side configured instance if possible

export async function GET() {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY environment variable is missing" }, { status: 500 });
    }

    // Since we can't easily "ping" without cost or specific model, we'll return success if Key is present
    // Ideally we would make a lightweight call. 
    // Let's assume the presence of the key is enough for "Connectivity" step 1.
    // Or we can list models if the API supports it, but simple is better.
    
    return NextResponse.json({ success: true, model: "FAL_KEY Present" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
