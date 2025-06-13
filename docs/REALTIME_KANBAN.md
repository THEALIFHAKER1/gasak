# Real-time Kanban Board

This implementation adds real-time updates to the kanban board so that when one user makes changes, all other users see those changes instantly.

## How it Works

### Server-Sent Events (SSE)

- Uses Server-Sent Events for real-time communication from server to clients
- More reliable than WebSockets for this use case
- Automatically reconnects on connection loss

### Architecture

1. **SSE Endpoint**: `/api/admin/kanban/ws`

   - Establishes SSE connections for authenticated users
   - Manages connection lifecycle

2. **SSE Manager**: `src/lib/sse-manager.ts`

   - Manages all active SSE connections
   - Broadcasts updates to connected clients
   - Handles connection cleanup

3. **Real-time Hook**: `src/hooks/use-kanban-realtime.ts`

   - Client-side hook that connects to SSE endpoint
   - Listens for updates and refreshes relevant data
   - Auto-reconnects on errors

4. **API Integration**: All kanban API endpoints now broadcast updates:
   - Task creation, updates, deletion
   - Column creation, updates, deletion
   - Board updates

### Features

#### Real-time Updates

- **Task Changes**: When users create, move, edit, or delete tasks
- **Column Changes**: When users create, edit, or delete columns
- **Board Changes**: When board structure changes

#### Smart Updates

- Only updates relevant data (tasks vs columns vs boards)
- Filters updates by board ID (users only see updates for their current board)
- Excludes the user who made the change (no echo)

#### Connection Management

- Automatic connection establishment
- Reconnection on errors with 5-second delay
- Proper cleanup on component unmount

## Usage

The real-time features are automatically enabled when viewing the kanban board. No additional setup is required.

### For Users

1. Open the kanban board in multiple browser tabs/windows
2. Make changes in one tab (move tasks, create columns, etc.)
3. See the changes appear instantly in other tabs

### For Developers

The real-time hook is automatically used in `KanbanBoardWrapper`:

```tsx
import { useKanbanRealtime } from "@/hooks/use-kanban-realtime";

export function KanbanBoardWrapper() {
  // Enable real-time updates
  useKanbanRealtime();

  // ... rest of component
}
```

## Technical Details

### Update Types

- `task_created`: New task added
- `task_updated`: Task modified (including moves)
- `task_deleted`: Task removed
- `column_created`: New column added
- `column_updated`: Column modified
- `column_deleted`: Column removed
- `board_updated`: Board structure changed

### Data Flow

1. User makes change via UI
2. Frontend calls API endpoint
3. API endpoint updates database
4. API endpoint broadcasts update via SSE manager
5. All connected clients receive update
6. Clients refresh relevant data
7. UI updates automatically

### Error Handling

- Connection errors trigger automatic reconnection
- Failed broadcasts are logged and connections cleaned up
- Parse errors are caught and logged
- Graceful degradation if SSE is not supported

## Performance Considerations

- SSE connections are lightweight and persistent
- Only sends minimal update notifications (not full data)
- Clients fetch fresh data only when needed
- Automatic cleanup prevents memory leaks
- Board-specific filtering reduces unnecessary updates

## Browser Support

Server-Sent Events are supported in all modern browsers:

- Chrome 6+
- Firefox 6+
- Safari 5+
- Edge 12+

## Future Enhancements

Possible improvements:

1. Add user presence indicators (show who's online)
2. Show live cursors for active users
3. Add conflict resolution for simultaneous edits
4. Implement optimistic updates for better UX
5. Add typing indicators for task descriptions
