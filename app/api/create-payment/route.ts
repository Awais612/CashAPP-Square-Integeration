import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const { sourceId, amount } = await request.json().catch(() => ({} as any));

  const amountCents = Number.isFinite(amount)
    ? Number(amount)
    : Number.parseInt(String(amount), 10);

  if (!sourceId || !Number.isFinite(amountCents)) {
    return NextResponse.json(
      {
        error: "Invalid request",
        details: "sourceId and numeric amount (in cents) are required",
      },
      { status: 400 }
    );
  }

  // Optional: enforce bounds that match your UI (min $5, max $500)
  if (amountCents < 500 || amountCents > 50000) {
    return NextResponse.json(
      {
        error: "Amount out of range",
        details: "Must be between $5.00 and $500.00",
      },
      { status: 400 }
    );
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN!;
  console.log("Access token:", accessToken);
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;

  const paymentPayload = {
    idempotency_key: crypto.randomUUID(),
    source_id: sourceId,
    location_id: locationId,
    autocomplete: true,
    amount_money: {
      amount: amountCents,
      currency: "USD",
    },
  };

  console.log("✅ Payment request received:", { sourceId, amountCents });
  console.log("🌍 Environment:", process.env.SQUARE_ENVIRONMENT);
  console.log("📦 Request Payload:", JSON.stringify(paymentPayload));

  try {
    const response = await fetch(`https://connect.squareup.com/v2/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("💥 Payment failed:", JSON.stringify(data, null, 2));
      return new NextResponse(
        JSON.stringify({
          error: "Square payment failed",
          details: data,
        }),
        { status: response.status }
      );
    }

    console.log("💰 Payment succeeded:", JSON.stringify(data, null, 2));

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("🔥 Unexpected error:", error);

    return new NextResponse(
      JSON.stringify({ error: "Unexpected server error", details: error }),
      { status: 500 }
    );
  }
}
