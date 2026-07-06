import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../services/notificationApi';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getNotifications(params);
      // BUG-022: null-safe access — never assume the nested data shape exists.
      return response?.data?.data ?? { notifications: [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUnreadNotificationCount();
      // BUG-022: null-safe access — default to a zero count if the shape is missing.
      return response?.data?.data ?? { count: 0 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await markNotificationAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (error) {
      // error.response is absent when the request never reached the server
      // (axios cancel from the CSRF guard, timeout, network down) — fall back to
      // error.message so those failures are still surfaced, not silent.
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to mark all notifications as read'
      );
    }
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/removeNotification',
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  loading: false,
  error: null,
  unreadCountLoading: false,
  unreadCountError: null,
  markingAllRead: false,
  // requestIds of the LATEST fetch dispatched for each resource. Responses from
  // older, still-in-flight fetches are ignored so they can never overwrite newer
  // state (e.g. a list fetched just before "mark all read" landing just after it
  // and reverting everything to unread).
  latestListRequestId: null,
  latestCountRequestId: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const incoming = action.payload;
      if (!incoming || incoming.id == null) return;
      // Ignore duplicates — a socket may replay or two emit paths may both fire.
      if (state.notifications.some((n) => n.id === incoming.id)) return;
      state.notifications.unshift(incoming);
      if (!incoming.isRead) {
        state.unreadCount += 1;
      }
    },
    // Authoritative unread count pushed over the socket (notification:count).
    // Lets the badge update in real time without an HTTP round-trip.
    setUnreadCount: (state, action) => {
      const count = Number(action.payload);
      if (Number.isFinite(count) && count >= 0) {
        state.unreadCount = count;
      }
    },
    clearError: (state) => {
      state.error = null;
      state.unreadCountError = null;
    },
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications[index] = { ...state.notifications[index], ...updates };
        
        // Update unread count if read status changed
        if (wasUnread && updates.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !updates.isRead) {
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.latestListRequestId = action.meta.requestId;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        // Stale response — a newer fetch has been dispatched since; drop it.
        if (action.meta.requestId !== state.latestListRequestId) return;
        state.loading = false;
        const payload = action.payload || {};
        state.notifications = payload.notifications || [];
        // The user endpoint returns flat { total, page, totalPages }, while the
        // admin endpoint returns a nested { pagination } object. Normalize both.
        const p = payload.pagination || {};
        const total = p.total ?? payload.total ?? 0;
        const limit = p.limit ?? state.pagination.limit ?? 20;
        const pages = p.pages ?? payload.totalPages ?? (limit ? Math.ceil(total / limit) : 0);
        state.pagination = {
          total,
          page: p.page ?? payload.page ?? 1,
          limit,
          pages,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestListRequestId) return;
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state, action) => {
        state.unreadCountLoading = true;
        state.unreadCountError = null;
        state.latestCountRequestId = action.meta.requestId;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        // Stale response — a newer count fetch has been dispatched since; drop it.
        if (action.meta.requestId !== state.latestCountRequestId) return;
        state.unreadCountLoading = false;
        state.unreadCount = action.payload.count;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestCountRequestId) return;
        state.unreadCountLoading = false;
        state.unreadCountError = action.payload;
      });

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark notification as read';
      });

    // Mark all as read
    builder
      .addCase(markAllAsRead.pending, (state) => {
        state.markingAllRead = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.markingAllRead = false;
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        // Without this case a failed request left the UI completely unchanged —
        // the button looked dead. Surface the failure in the list's error banner.
        state.markingAllRead = false;
        state.error = action.payload || 'Failed to mark all notifications as read';
      });

    // Delete notification
    builder
      .addCase(removeNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      });
  }
});

export const { addNotification, setUnreadCount, clearError, updateNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
