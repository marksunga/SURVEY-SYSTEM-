/**
 * Navigation active state helper functions for IT Department Portal.
 * Enforces strict single-click, mutually-exclusive active highlighting.
 */

/**
 * Determines whether a student navigation item is active given the current route.
 * Guarantees that /surveys ("Available Surveys") and /surveys/history ("My Submissions")
 * are mutually exclusive and NEVER highlighted simultaneously.
 */
export function isStudentNavItemActive(itemHref: string, currentPath: string): boolean {
  if (!currentPath || !itemHref) return false;

  // Exact match for dashboard
  if (itemHref === '/student/dashboard') {
    return currentPath === '/student/dashboard';
  }

  // "My Submissions" is active ONLY on /surveys/history and its direct sub-paths
  if (itemHref === '/surveys/history') {
    return (
      currentPath === '/surveys/history' ||
      currentPath.startsWith('/surveys/history/') ||
      currentPath.startsWith('/surveys/history?')
    );
  }

  // "Available Surveys" is active on /surveys or specific survey pages (e.g. /surveys/[id]),
  // but explicitly EXCLUDES /surveys/history
  if (itemHref === '/surveys') {
    if (
      currentPath === '/surveys/history' ||
      currentPath.startsWith('/surveys/history/') ||
      currentPath.startsWith('/surveys/history?')
    ) {
      return false;
    }
    return currentPath === '/surveys' || currentPath.startsWith('/surveys/');
  }

  // "Submit Feedback"
  if (itemHref === '/feedback') {
    return currentPath === '/feedback' || currentPath.startsWith('/feedback/');
  }

  // "Scan Survey QR"
  if (itemHref === '/scan') {
    return currentPath === '/scan' || currentPath.startsWith('/scan/');
  }

  // "Notifications"
  if (itemHref === '/notifications') {
    return currentPath === '/notifications' || currentPath.startsWith('/notifications/');
  }

  return currentPath === itemHref;
}

/**
 * Determines whether an admin navigation item is active given the current route.
 */
export function isAdminNavItemActive(itemHref: string, currentPath: string): boolean {
  if (!currentPath || !itemHref) return false;

  if (itemHref === '/admin/dashboard') {
    return currentPath === '/admin/dashboard';
  }

  if (itemHref === '/admin/surveys/create') {
    return (
      currentPath === '/admin/surveys/create' ||
      currentPath.startsWith('/admin/surveys/create/')
    );
  }

  if (itemHref === '/admin/feedback') {
    return (
      currentPath === '/admin/feedback' ||
      currentPath.startsWith('/admin/feedback/')
    );
  }

  if (itemHref === '/admin/reports') {
    return (
      currentPath === '/admin/reports' ||
      currentPath.startsWith('/admin/reports/')
    );
  }

  if (itemHref === '/admin/qr-codes') {
    return (
      currentPath === '/admin/qr-codes' ||
      currentPath.startsWith('/admin/qr-codes/')
    );
  }

  if (itemHref === '/admin/notifications/send') {
    return (
      currentPath === '/admin/notifications/send' ||
      currentPath === '/admin/notifications' ||
      currentPath.startsWith('/admin/notifications/send/')
    );
  }

  if (itemHref === '/admin/notifications/history') {
    return (
      currentPath === '/admin/notifications/history' ||
      currentPath.startsWith('/admin/notifications/history/')
    );
  }

  if (itemHref === '/admin/audit-logs') {
    return (
      currentPath === '/admin/audit-logs' ||
      currentPath.startsWith('/admin/audit-logs/')
    );
  }

  if (itemHref === '/admin/profile') {
    return (
      currentPath === '/admin/profile' ||
      currentPath.startsWith('/admin/profile/')
    );
  }

  return currentPath === itemHref;
}

