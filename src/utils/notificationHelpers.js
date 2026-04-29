import { NotificationPriority, NotificationType } from '../types/notificationTypes';

export const getNotificationIcon = (type) => {
  const iconMap = {
    [NotificationType.MESSAGE_RECEIVED]: '💬',
    [NotificationType.CASE_ASSIGNED]: '📋',
    [NotificationType.CASE_UPDATED]: '🔄',
    [NotificationType.DEADLINE_REMINDER]: '⏰',
    [NotificationType.SYSTEM_ANNOUNCEMENT]: '📢',
    [NotificationType.PERMISSION_GRANTED]: '🔑',
    [NotificationType.ROLE_ASSIGNED]: '👤',
    [NotificationType.DOCUMENT_UPLOADED]: '📄',
    [NotificationType.ESCALATION_CREATED]: '🚨',
    [NotificationType.TASK_COMPLETED]: '✅'
  };
  
  return iconMap[type] || '🔔';
};

export const getPriorityColor = (priority) => {
  const colorMap = {
    [NotificationPriority.URGENT]: 'text-red-600 bg-red-50 border-red-200',
    [NotificationPriority.HIGH]: 'text-orange-600 bg-orange-50 border-orange-200',
    [NotificationPriority.MEDIUM]: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    [NotificationPriority.LOW]: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  
  return colorMap[priority] || colorMap[NotificationPriority.LOW];
};

export const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

export const getNotificationActionText = (notification) => {
  const actionTexts = {
    [NotificationType.MESSAGE_RECEIVED]: 'View Message',
    [NotificationType.CASE_ASSIGNED]: 'View Case',
    [NotificationType.CASE_UPDATED]: 'View Case',
    [NotificationType.DEADLINE_REMINDER]: 'View Task',
    [NotificationType.SYSTEM_ANNOUNCEMENT]: 'Read More',
    [NotificationType.PERMISSION_GRANTED]: 'View Permissions',
    [NotificationType.ROLE_ASSIGNED]: 'View Profile',
    [NotificationType.DOCUMENT_UPLOADED]: 'View Document',
    [NotificationType.ESCALATION_CREATED]: 'View Escalation',
    [NotificationType.TASK_COMPLETED]: 'View Task'
  };
  
  return actionTexts[notification.type] || 'View Details';
};

export const getNotificationRoute = (notification) => {
  if (notification.entityType === 'message' && notification.metadata?.conversationId) {
    return `/messages/${notification.metadata.conversationId}`;
  }
  
  if (notification.entityType === 'case' && notification.entityId) {
    return `/cases/${notification.entityId}`;
  }
  
  if (notification.entityType === 'document' && notification.entityId) {
    return `/documents/${notification.entityId}`;
  }
  
  if (notification.entityType === 'escalation' && notification.entityId) {
    return `/escalations/${notification.entityId}`;
  }
  
  if (notification.entityType === 'task' && notification.entityId) {
    return `/tasks/${notification.entityId}`;
  }
  
  return '/notifications';
};

export const groupNotificationsByDate = (notifications) => {
  const groups = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.sentAt);
    let groupKey;

    if (notificationDate >= today) {
      groupKey = 'Today';
    } else if (notificationDate >= yesterday) {
      groupKey = 'Yesterday';
    } else if (notificationDate >= lastWeek) {
      groupKey = 'Last 7 Days';
    } else if (notificationDate >= lastMonth) {
      groupKey = 'Last 30 Days';
    } else {
      groupKey = 'Older';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
};

export const sortNotificationsByPriority = (notifications) => {
  const priorityOrder = {
    [NotificationPriority.URGENT]: 0,
    [NotificationPriority.HIGH]: 1,
    [NotificationPriority.MEDIUM]: 2,
    [NotificationPriority.LOW]: 3
  };

  return [...notifications].sort((a, b) => {
    // First sort by unread status
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    
    // Then sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Finally sort by date (newest first)
    return new Date(b.sentAt) - new Date(a.sentAt);
  });
};

export const createNotificationPayload = (type, title, message, entityId, entityType, metadata = {}) => {
  return {
    type,
    title,
    message,
    actionType: type,
    entityId,
    entityType,
    metadata,
    priority: metadata.priority || NotificationPriority.MEDIUM,
    sendEmail: metadata.sendEmail || false,
    scheduledFor: metadata.scheduledFor || null
  };
};
