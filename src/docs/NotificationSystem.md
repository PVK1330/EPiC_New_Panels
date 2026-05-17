# Notification System Documentation

This document provides a comprehensive guide to the notification system implemented in the EPiC CRM application.

## Overview

The notification system provides real-time updates to users about various events such as messages, case assignments, deadline reminders, and system announcements. It includes a complete API integration, Redux state management, and reusable UI components.

## API Endpoints

The system integrates with the following API endpoints:

### Core Endpoints
- `GET /api/notifications` - Fetch user notifications with pagination
- `GET /api/notifications/unread-count` - Get unread notification count
- `PATCH /api/notifications/:id/mark-read` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin Endpoints
- `GET /api/notifications/admin/all` - Get all notifications (admin)
- `POST /api/notifications/admin/create` - Create manual notification
- `GET /api/notifications/admin/stats` - Get admin notification stats
- `POST /api/notifications/admin/process-scheduled` - Process scheduled notifications
- `DELETE /api/notifications/admin/delete-expired` - Delete expired notifications

## File Structure

```
src/
├── components/Notifications/
│   ├── NotificationItem.jsx      # Individual notification component
│   ├── NotificationList.jsx      # List of notifications
│   └── NotificationDropdown.jsx  # Dropdown for header
├── hooks/
│   └── useNotifications.js       # Custom hook for notification logic
├── pages/Notifications/
│   └── NotificationsPage.jsx     # Full notifications page
├── services/
│   └── notificationApi.js        # API service functions
├── store/slices/
│   └── notificationSlice.js      # Redux state management
├── types/
│   └── notificationTypes.js      # TypeScript-like constants
└── utils/
    └── notificationHelpers.js     # Utility functions
```

## Usage Examples

### 1. Using the Notification Dropdown

Add the dropdown to your header component:

```jsx
import NotificationDropdown from '../components/Notifications/NotificationDropdown';

function Header() {
  return (
    <header>
      {/* Other header content */}
      <NotificationDropdown />
    </header>
  );
}
```

### 2. Using the Custom Hook

```jsx
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotifications
  } = useNotifications({
    autoFetch: true,
    pollingInterval: 30000
  });

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <button onClick={handleMarkAllRead}>Mark All Read</button>
    </div>
  );
}
```

### 3. Using the Notification List

```jsx
import NotificationList from '../components/Notifications/NotificationList';

function NotificationsPanel() {
  return (
    <div>
      <NotificationList showUnreadOnly={false} />
    </div>
  );
}
```

### 4. Creating a New Notification

```jsx
import { createNotificationPayload } from '../utils/notificationHelpers';
import { addNotification } from '../store/slices/notificationSlice';

const notificationPayload = createNotificationPayload(
  'message_received',
  'New Message',
  'You have received a new message from John Doe',
  123,
  'message',
  {
    senderName: 'John Doe',
    conversationId: 456,
    priority: 'high'
  }
);

dispatch(addNotification(notificationPayload));
```

## Notification Types

The system supports the following notification types:

- `message_received` - New message received
- `case_assigned` - Case assigned to user
- `case_updated` - Case details updated
- `deadline_reminder` - Deadline approaching
- `system_announcement` - System-wide announcements
- `permission_granted` - New permissions granted
- `role_assigned` - Role assignment
- `document_uploaded` - Document uploaded
- `escalation_created` - New escalation created
- `task_completed` - Task completed

## Priority Levels

- `urgent` - Critical notifications (red styling)
- `high` - Important notifications (orange styling)
- `medium` - Normal notifications (yellow styling)
- `low` - Low priority notifications (gray styling)

## State Management

The notification system uses Redux Toolkit for state management. The state includes:

```javascript
{
  notifications: [],      // Array of notification objects
  unreadCount: 0,         // Number of unread notifications
  pagination: {          // Pagination info
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  loading: false,        // Loading state for notifications
  error: null,          // Error state
  unreadCountLoading: false, // Loading state for unread count
  unreadCountError: null     // Error state for unread count
}
```

## Real-time Updates

The system supports real-time updates through:

1. **Polling**: Automatic polling for unread count every 30 seconds
2. **Socket Integration**: Ready for WebSocket integration
3. **Manual Updates**: Dispatch actions to add/update notifications

## Utility Functions

### Time Formatting
```jsx
import { formatNotificationTime } from '../utils/notificationHelpers';

const timeAgo = formatNotificationTime('2026-04-23T18:20:33.595Z');
// Returns: "2 hours ago"
```

### Route Generation
```jsx
import { getNotificationRoute } from '../utils/notificationHelpers';

const route = getNotificationRoute(notification);
// Returns: "/messages/15" or "/cases/44" etc.
```

### Priority Styling
```jsx
import { getPriorityColor } from '../utils/notificationHelpers';

const className = getPriorityColor('high');
// Returns: "text-orange-600 bg-orange-50 border-orange-200"
```

## Styling

The notification system uses Tailwind CSS with consistent styling:

- **Responsive design** for mobile and desktop
- **Hover states** for interactive elements
- **Loading states** with spinners
- **Error handling** with user-friendly messages
- **Accessibility** with proper ARIA labels

## Error Handling

The system includes comprehensive error handling:

- API errors are caught and displayed to users
- Network timeouts are handled gracefully
- 401 errors trigger automatic logout
- Error states can be cleared manually

## Performance Considerations

- **Pagination**: Large notification lists are paginated
- **Polling**: Configurable polling intervals
- **Caching**: Redux state acts as cache
- **Lazy Loading**: Components load data when needed
- **Debouncing**: Search inputs are debounced

## Integration Points

### Header Integration
Add `NotificationDropdown` to your main header component.

### Routing
Add the notifications page to your router:

```jsx
{
  path: '/notifications',
  element: <NotificationsPage />
}
```

### Layout Integration
The notification dropdown works best in fixed headers or sidebars.

## Customization

### Adding New Notification Types
1. Add the type to `notificationTypes.js`
2. Update the icon mapping in `notificationHelpers.js`
3. Add styling in `NotificationItem.jsx`
4. Update action text mapping

### Custom Styling
Modify the Tailwind classes in the components to match your design system.

### API Configuration
Update the base URL and authentication in `api.js`.

## Testing

The notification system is designed to be testable:

- Redux actions can be tested independently
- Components accept props for testing
- API services can be mocked
- Custom hooks can be tested with React Testing Library

## Security

- All API calls include authentication tokens
- Input validation on the backend
- XSS protection through proper escaping
- CSRF protection through headers
