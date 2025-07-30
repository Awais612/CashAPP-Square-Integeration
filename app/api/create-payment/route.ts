import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const body = await request.json();

  const accessToken = process.env.SQUARE_ACCESS_TOKEN!;
  console.log("Access token:", accessToken);
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;
  // const env =
  //   process.env.SQUARE_ENVIRONMENT === "production"
  //     ? "https://connect.squareup.com"
  //     : "https://connect.squareupsandbox.com";

  const paymentPayload = {
    idempotency_key: crypto.randomUUID(),
    source_id: body.sourceId,
    location_id: locationId,
    autocomplete: true,
    amount_money: {
      amount: body.amount,
      currency: "USD",
    },
  };

  console.log("✅ Payment request received:", body);
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
