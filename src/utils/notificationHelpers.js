import { NotificationPriority, NotificationType } from '../types/notificationTypes';
import { formatDate } from './datetime';

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
  
  return formatDate(date);
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

function resolveRoleKey(user) {
  if (!user) return null;
  const roleId = Number(user.role_id);
  if (roleId === 3 || user.role === 'admin') return 'admin';
  if (roleId === 2 || user.role === 'caseworker') return 'caseworker';
  if (roleId === 1 || user.role === 'candidate') return 'candidate';
  if (roleId === 4 || user.role === 'business' || user.role === 'sponsor') return 'business';
  if (roleId === 5 || user.role === 'superadmin') return 'superadmin';
  return user.role || null;
}

/** The role's generic notification-centre page (fallback / "View all"). */
function genericNotificationsRoute(role) {
  if (role === 'admin') return '/admin/notifications';
  if (role === 'caseworker') return '/caseworker/notifications';
  if (role === 'candidate') return '/candidate/notifications';
  if (role === 'business') return '/business/notifications';
  if (role === 'superadmin') return '/superadmin/notifications';
  return '/notifications';
}

const enc = (v) => encodeURIComponent(String(v));

/**
 * Resolve the role-correct destination for a case-bearing notification.
 * `caseRef` should be the human case reference (e.g. CAS-000004); the backend
 * case-detail endpoint also accepts the numeric id, so a numeric fallback works.
 */
function caseTarget(role, caseRef, actionType, md = {}) {
  if (role === 'admin') {
    // CCL fee proposals have a dedicated approvals queue.
    if (actionType === 'ccl_fee_review') return { path: '/admin/ccl-fee-approvals' };
    return caseRef ? { path: `/admin/case-detail/${enc(caseRef)}` } : { path: '/admin/cases' };
  }
  if (role === 'caseworker') {
    // The caseworker case list opens a per-case modal from navigation state.
    return caseRef
      ? { path: '/caseworker/cases', state: { openCaseRef: String(caseRef) } }
      : { path: '/caseworker/cases' };
  }
  if (role === 'candidate') {
    if (actionType === 'ccl_issued' || actionType === 'ccl_fee_approved') return { path: '/candidate/ccl' };
    if (actionType === 'data_capture_request' || actionType === 'data_capture_rejected') {
      return { path: '/candidate/document-checklist' };
    }
    if (md.nextStage === 'draft_application_review') return { path: '/candidate/application' };
    return { path: '/candidate/application-status' };
  }
  if (role === 'business') {
    // Sponsors have no "cases" page — the worker is the nearest equivalent.
    return { path: '/business/workers' };
  }
  return null;
}

/**
 * Role-aware deep link target for an in-app notification.
 *
 * Returns `{ path, state? }` for a concrete destination, or `null` when the
 * notification has no specific page (the caller then shows the details modal).
 * It resolves from the fields the backend already sends on every notification:
 * `entityType`, `entityId`, `actionType`, `category`, `metadata`, `actionUrl`.
 */
export function resolveNotificationTarget(notification, user = null) {
  const role = resolveRoleKey(user);
  if (!notification || !role) return null;

  const entityType = notification.entityType;
  const category = notification.category;
  const actionType = notification.actionType || notification?.metadata?.actionType;
  const md = notification.metadata || {};
  const entityId = notification.entityId;

  // 0. An explicit actionUrl wins — but ONLY when it targets THIS user's own
  //    area. A single event (e.g. "licence submitted") notifies several roles
  //    with one shared actionUrl, so a role-blind redirect would mis-route.
  if (typeof notification.actionUrl === 'string' && notification.actionUrl.startsWith(`/${role}/`)) {
    return { path: notification.actionUrl };
  }

  // Prefer the human case reference; fall back to the numeric entityId (the
  // case-detail endpoint and the caseworker modal both accept either form).
  const caseRef =
    md.caseRef ||
    md.caseId ||
    md.case_reference ||
    (entityType === 'case' && entityId != null ? String(entityId) : null);

  // 1. Messages / conversations
  if (entityType === 'message' || entityType === 'conversation' || category === 'message') {
    const convo = md.conversationId || (entityType === 'conversation' ? entityId : null);
    if (role === 'admin') return { path: convo ? `/admin/messages?conversation=${enc(convo)}` : '/admin/messages' };
    if (role === 'caseworker') return { path: convo ? `/caseworker/messages?conversation=${enc(convo)}` : '/caseworker/messages' };
    if (role === 'candidate') return { path: '/candidate/messages' };
    if (role === 'business') return { path: '/business/messages' };
  }

  // 2. Sponsor licence applications
  if (entityType === 'licence_application' || entityType === 'sponsor' || category === 'sponsorship') {
    if (role === 'admin') return { path: entityId ? `/admin/licence/v2/${enc(entityId)}` : '/admin/licence-requests' };
    if (role === 'caseworker') return { path: entityId ? `/caseworker/licence/v2/${enc(entityId)}` : '/caseworker/licence-reviews' };
    if (role === 'business') return { path: '/business/licence' };
  }

  // 3. Certificate of Sponsorship requests
  if (entityType === 'cos_request' || category === 'cos') {
    if (role === 'admin') return { path: '/admin/cos-requests' };
    if (role === 'caseworker') return { path: '/caseworker/cos-requests' };
    if (role === 'business') return { path: '/business/cosallocation' };
  }

  // 4. Compliance reviews (compliance docs, right-to-work, reviewed worker
  //    events / change requests — anything in the compliance category).
  if (entityType === 'compliance_document' || entityType === 'right_to_work' || category === 'compliance') {
    if (role === 'admin') return { path: '/admin/compliance-review' };
    if (role === 'caseworker') return { path: '/caseworker/compliance-review' };
    if (role === 'business') return { path: '/business/compliance-review' };
  }

  // 5. Payments / invoices
  if (entityType === 'payment' || entityType === 'case_payment' || category === 'payment') {
    if (role === 'admin') return { path: '/admin/finance' };
    if (role === 'caseworker') return { path: '/caseworker/finance' };
    if (role === 'candidate') return { path: '/candidate/payments' };
    if (role === 'business') return { path: '/business/payment' };
  }

  // 6. Escalations — admin has a dedicated page; caseworker has none, so fall
  //    back to the underlying case when we know it.
  if (entityType === 'escalation') {
    if (role === 'admin') return { path: '/admin/escalations' };
    if (caseRef) return caseTarget(role, caseRef, actionType, md);
  }

  // 7. Worker events / change requests not already caught as compliance.
  if (entityType === 'worker_event' || entityType === 'worker' || entityType === 'change_request') {
    if (role === 'business') {
      const candidateId = md.candidateId || md.workerId;
      return candidateId
        ? { path: '/business/worker-details', state: { candidateId } }
        : { path: '/business/workers' };
    }
    if (caseRef) return caseTarget(role, caseRef, actionType, md);
    if (role === 'admin') return { path: '/admin/compliance-review' };
    if (role === 'caseworker') return { path: '/caseworker/compliance-review' };
  }

  // 8. Documents
  if (entityType === 'document' || category === 'document') {
    if (role === 'admin') return caseRef ? caseTarget('admin', caseRef, actionType, md) : { path: '/admin/documents' };
    if (role === 'caseworker') return { path: '/caseworker/documents/upload' };
    if (role === 'candidate') return { path: '/candidate/documents' };
    if (role === 'business') return { path: '/business/documents' };
  }

  // 9. Cases, tasks, and anything else carrying a case reference (stage
  //    changes, biometrics, CCL, fee reviews...).
  if (entityType === 'case' || entityType === 'task' || caseRef) {
    return caseTarget(role, caseRef, actionType, md);
  }

  return null; // no specific destination → caller shows the modal fallback
}

/**
 * Role-aware deep link (path only). Thin wrapper over resolveNotificationTarget
 * that always returns a usable path — used by the bell's "View all" footer,
 * where an empty notification should land on the generic notifications centre.
 */
export function getNotificationRoute(notification, user = null) {
  const target = resolveNotificationTarget(notification, user);
  return target?.path || genericNotificationsRoute(resolveRoleKey(user));
}

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
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
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
