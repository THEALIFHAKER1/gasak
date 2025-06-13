import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { registerConnection, unregisterConnection } from "@/lib/sse-manager";

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Register the connection
      registerConnection(userId, controller);

      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({ type: "connected", userId })}\n\n`,
      );
    },
    cancel() {
      // Clean up when connection is closed
      unregisterConnection(userId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
