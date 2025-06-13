// Store SSE connections
const connections = new Map<string, ReadableStreamDefaultController>();

// Function to register a connection
export function registerConnection(
  userId: string,
  controller: ReadableStreamDefaultController,
) {
  connections.set(userId, controller);
  console.log(`SSE connected for user: ${userId}`);
}

// Function to unregister a connection
export function unregisterConnection(userId: string) {
  connections.delete(userId);
  console.log(`SSE disconnected for user: ${userId}`);
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(
  data: Record<string, unknown>,
  excludeUserId?: string,
) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  connections.forEach((controller, userId) => {
    if (userId !== excludeUserId) {
      try {
        controller.enqueue(message);
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
        connections.delete(userId);
      }
    }
  });
}
