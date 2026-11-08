import * as assert from 'assert';
import { isStudentNavItemActive, isAdminNavItemActive } from '../lib/navigation';

console.log('--- Testing Navigation Active State Logic ---');

const studentNav = [
  '/student/dashboard',
  '/surveys',
  '/surveys/history',
  '/feedback',
  '/scan',
  '/notifications',
];

function getActiveStudentItems(currentPath: string): string[] {
  return studentNav.filter((href) => isStudentNavItemActive(href, currentPath));
}

// 1. Dashboard
console.log('Testing /student/dashboard...');
assert.deepStrictEqual(getActiveStudentItems('/student/dashboard'), ['/student/dashboard']);

// 2. Available Surveys (list)
console.log('Testing /surveys (Available Surveys)...');
assert.deepStrictEqual(getActiveStudentItems('/surveys'), ['/surveys']);

// 3. Available Surveys (filling a survey: /surveys/uuid-1234)
console.log('Testing /surveys/uuid-1234...');
assert.deepStrictEqual(getActiveStudentItems('/surveys/uuid-1234'), ['/surveys']);

// 4. My Submissions (/surveys/history) - CRITICAL: Must NOT highlight /surveys!
console.log('Testing /surveys/history (My Submissions)...');
const onHistory = getActiveStudentItems('/surveys/history');
assert.deepStrictEqual(onHistory, ['/surveys/history'], 'Only My Submissions should be active on /surveys/history');
assert.strictEqual(isStudentNavItemActive('/surveys', '/surveys/history'), false, '/surveys must not be active on /surveys/history');

// 5. My Submissions details (/surveys/history/sub-123)
console.log('Testing /surveys/history/sub-123...');
assert.deepStrictEqual(getActiveStudentItems('/surveys/history/sub-123'), ['/surveys/history']);

// 6. Submit Feedback (/feedback)
console.log('Testing /feedback...');
assert.deepStrictEqual(getActiveStudentItems('/feedback'), ['/feedback']);

// 7. Scan QR (/scan)
console.log('Testing /scan...');
assert.deepStrictEqual(getActiveStudentItems('/scan'), ['/scan']);

// 8. Notifications (/notifications)
console.log('Testing /notifications...');
assert.deepStrictEqual(getActiveStudentItems('/notifications'), ['/notifications']);

// 9. Admin Navigation Tests
console.log('Testing Admin Navigation...');
assert.strictEqual(isAdminNavItemActive('/admin/dashboard', '/admin/dashboard'), true);
assert.strictEqual(isAdminNavItemActive('/admin/dashboard', '/admin/audit-logs'), false);
assert.strictEqual(isAdminNavItemActive('/admin/surveys/create', '/admin/surveys/create'), true);
assert.strictEqual(isAdminNavItemActive('/admin/feedback', '/admin/feedback'), true);
assert.strictEqual(isAdminNavItemActive('/admin/reports', '/admin/reports'), true);
assert.strictEqual(isAdminNavItemActive('/admin/qr-codes', '/admin/qr-codes'), true);
assert.strictEqual(isAdminNavItemActive('/admin/notifications/send', '/admin/notifications/send'), true);
assert.strictEqual(isAdminNavItemActive('/admin/notifications/history', '/admin/notifications/history'), true);
assert.strictEqual(isAdminNavItemActive('/admin/audit-logs', '/admin/audit-logs'), true);
assert.strictEqual(isAdminNavItemActive('/admin/profile', '/admin/profile'), true);

console.log(' All navigation active state tests PASSED successfully!');

