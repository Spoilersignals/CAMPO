import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "Anonymous";
  const message = searchParams.get("message") || "send me anonymous messages!";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ec4899 0%, #f97316 50%, #eab308 100%)",
          padding: "40px",
        }}
      >
        {/* Top Text */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 600,
            color: "white",
            marginBottom: 30,
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          send me anonymous messages! 💬
        </div>

        {/* White Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: 24,
            padding: "50px 60px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            maxWidth: "900px",
            minHeight: "250px",
          }}
        >
          {/* Message Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              marginBottom: 24,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          {/* Message Content */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#1f2937",
              textAlign: "center",
              lineHeight: 1.3,
              maxWidth: "750px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {message.length > 120 ? message.slice(0, 120) + "..." : message}
          </div>
        </div>

        {/* Bottom Branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 600,
              color: "white",
              marginBottom: 8,
            }}
          >
            @{username}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 20,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span style={{ fontWeight: 700 }}>ComradeZone</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
