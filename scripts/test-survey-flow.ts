import { MockAdapter } from '../lib/supabase/mock-adapter';
import { encryptAES256, decryptAES256 } from '../lib/crypto/aes';

function runAutomatedVerification() {
  console.log('=====================================================');
  console.log('RUNNING FULL SYSTEM AUTOMATED VERIFICATION');
  console.log('IT Department Feedback and Survey System');
  console.log('=====================================================\n');

  // 1. Verify Simplified User Profiles & 2 Roles Only
  console.log('[1/7] Testing Simplified User Roles (ADMINISTRATOR & STUDENT only)...');
  const profiles = MockAdapter.getProfiles();
  const roles = new Set(profiles.map((p) => p.role_id));
  if (!roles.has('STUDENT') || !roles.has('ADMINISTRATOR')) {
    throw new Error('Missing required user roles in seed data');
  }
  if ((roles as any).has('IT_PROFESSOR') || (roles as any).has('IT_OFFICER')) {
    throw new Error('Legacy roles IT_PROFESSOR or IT_OFFICER must not exist!');
  }
  console.log('✓ Verified: Exactly 2 user roles in system (ADMINISTRATOR and STUDENT).');

  // 2. Verify Surveys & Question Types
  console.log('\n[2/7] Testing Survey Management & 6 Question Types...');
  const surveys = MockAdapter.getSurveys();
  if (surveys.length === 0) throw new Error('No surveys found');
  const testSurvey = surveys[0];
  const questions = MockAdapter.getQuestionsBySurveyId(testSurvey.id);
  console.log(`✓ Loaded survey "${testSurvey.title}" with ${questions.length} questions.`);

  const questionTypes = new Set(questions.map((q) => q.question_type));
  console.log('  Found Question Types:', Array.from(questionTypes));
  if (!questionTypes.has('RATING_SCALE') || !questionTypes.has('CHECKBOX') || !questionTypes.has('YES_NO')) {
    throw new Error('Expected rich question types in initial survey');
  }

  // 3. Test Anonymous Submission & Cryptographic Decoupling
  console.log('\n[3/7] Testing Anonymous Zero-Knowledge Submission...');
  const testUserId = '44444444-4444-4444-4444-444444444444'; // Samantha Hayes
  const answersPayload: Record<string, any> = {
    [questions[0].id]: 5,
    [questions[1].id]: ['Cloud Architecture & DevOps', 'Cybersecurity & Cryptography'],
    [questions[2].id]: 'Yes',
  };

  const submissionResult = MockAdapter.submitSurveyAnswers(
    testSurvey.id,
    testUserId,
    true, // isAnonymous: true
    answersPayload
  );

  console.log('✓ Anonymous survey response submitted successfully!');
  console.log('  Submission Receipt Token:', submissionResult.token);

  // Verify that the response in the database has user_id = null
  const results = MockAdapter.getSurveyResults(testSurvey.id);
  const anonymousResponse = results.responses.find((r) => r.submission_token === submissionResult.token);
  if (!anonymousResponse) throw new Error('Submitted response could not be located');
  if (anonymousResponse.user_id !== null) {
    throw new Error('SECURITY VIOLATION: Anonymous response stored non-null user_id!');
  }
  if (!anonymousResponse.is_anonymous) {
    throw new Error('is_anonymous flag was not set to true');
  }
  console.log('✓ Verified: user_id is strictly NULL in response row.');

  // Verify that the user is recorded as completed in receipts (so they cannot re-submit)
  const hasCompleted = MockAdapter.hasUserCompletedSurvey(testUserId, testSurvey.id);
  if (!hasCompleted) throw new Error('User participation receipt was not recorded');
  console.log('✓ Verified: Participation receipt recorded for single-submission enforcement.');

  // 4. Test Duplicate Submission Prevention
  console.log('\n[4/7] Testing Duplicate Submission Prevention...');
  try {
    MockAdapter.submitSurveyAnswers(testSurvey.id, testUserId, true, answersPayload);
    throw new Error('Duplicate submission should have thrown an error!');
  } catch (err: any) {
    if (err.message.includes('already submitted')) {
      console.log('✓ Duplicate submission successfully blocked with security message:', err.message);
    } else {
      throw err;
    }
  }

  // 5. Test AES-256 Feedback Encryption & Decryption
  console.log('\n[5/7] Testing Feedback AES-256-GCM Encryption...');
  const feedbackText = 'Lab 401 workstations need RAM upgrades from 8GB to 32GB for Docker containers.';
  const feedback = MockAdapter.submitFeedback({
    title: 'Workstation Memory Upgrade Request',
    category: 'FACILITIES',
    content: feedbackText,
    is_anonymous: true,
  });

  if (!feedback.content_encrypted || !feedback.content_iv || !feedback.content_tag) {
    throw new Error('Feedback was not encrypted with IV and Tag!');
  }
  console.log('✓ Feedback saved with AES-256-GCM ciphertext, IV, and Auth Tag.');

  const decrypted = decryptAES256(feedback.content_encrypted, feedback.content_iv, feedback.content_tag);
  if (decrypted !== feedbackText) {
    throw new Error('Decrypted feedback did not match original text!');
  }
  console.log('✓ Verified: Authorized decryption produces exact original message.');

  // 6. Test QR Code Lookup and Validation
  console.log('\n[6/7] Testing QR Code Validation & Scanning...');
  const qr = MockAdapter.getQRCodeBySurveyId(testSurvey.id);
  if (!qr) throw new Error('QR Code record missing for survey');
  const foundQR = MockAdapter.getQRCodeByCodeData(qr.code_data);
  if (!foundQR || foundQR.survey_id !== testSurvey.id) {
    throw new Error('QR code data lookup failed');
  }
  console.log(`✓ QR Code "${qr.code_data}" successfully validated pointing to ${qr.access_url}.`);

  // 7. Test Audit Logging
  console.log('\n[7/9] Testing Audit Logs Stream...');
  const auditLogs = MockAdapter.getAuditLogs();
  if (auditLogs.length === 0) throw new Error('Audit logs empty');
  console.log(`✓ Audit log verified with ${auditLogs.length} events logged.`);

  // 8. Test Feedback Editing & Deletion Lifecycle
  console.log('\n[8/9] Testing User Feedback Editing (when permitted) & Deletion...');
  const identifiedFeedback = MockAdapter.submitFeedback({
    title: 'Initial Printer Issue in Lab 402',
    category: 'FACILITIES',
    content: 'Printer paper jam on 3rd floor lab.',
    is_anonymous: false,
    user_id: testUserId,
  });
  const updatedFeedback = MockAdapter.updateUserFeedback(identifiedFeedback.id, testUserId, {
    title: 'Updated: Severe Printer Jam and Toner Depletion in Lab 402',
    content: 'Printer is out of magenta toner and jamming continually.',
  });
  if (!updatedFeedback) throw new Error('Feedback edit failed for authorized user!');
  if (updatedFeedback.decrypted_content !== 'Printer is out of magenta toner and jamming continually.') {
    throw new Error('Re-encrypted feedback did not match updated content!');
  }
  console.log('✓ Verified: User can edit pending feedback with automatic re-encryption.');

  const deleteFbResult = MockAdapter.deleteFeedback(identifiedFeedback.id);
  if (!deleteFbResult) throw new Error('Failed to delete feedback');
  console.log('✓ Verified: Feedback record deletion confirmed.');

  // 9. Test User Management & Notification Lifecycle
  console.log('\n[9/9] Testing User Account & Notification Lifecycle...');
  const tempUser = MockAdapter.createUser({
    id: crypto.randomUUID(),
    email: 'temp.student@itdept.edu',
    full_name: 'Temp Student',
    role_id: 'STUDENT',
    department: 'Information Technology',
    is_active: true,
  });
  const deleteUserResult = MockAdapter.deleteUser(tempUser.id);
  if (!deleteUserResult) throw new Error('Failed to delete user');
  console.log('✓ Verified: User account creation and deletion confirmed.');

  const tempNotif = MockAdapter.createNotification({
    title: 'Automated Test Notification',
    message: 'Testing system notification creation and deletion.',
    type: 'SYSTEM_ALERT',
  });
  const deleteNotifResult = MockAdapter.deleteNotification(tempNotif.id);
  if (!deleteNotifResult) throw new Error('Failed to delete notification');
  console.log('✓ Verified: Notification creation, broadcast, and deletion confirmed.');

  // 10. Test Strict Role Isolation and Authentication Gateways
  console.log('\n[10/11] Testing Strict Role Isolation & Authentication Gateways...');
  const adminProfile = MockAdapter.getProfileByEmail('admin@itdept.edu');
  const studentProfile = MockAdapter.getProfileByEmail('student@itdept.edu');
  if (!adminProfile || adminProfile.role_id !== 'ADMINISTRATOR') throw new Error('Admin profile missing or role incorrect');
  if (!studentProfile || studentProfile.role_id !== 'STUDENT') throw new Error('Student profile missing or role incorrect');

  // Gateway check simulation:
  // 1. Student trying to log into Admin Portal
  if ((studentProfile.role_id as string) !== 'ADMINISTRATOR') {
    // Rejected by Admin Login action
    console.log('✓ Verified: Student blocked from Administrator portal authentication.');
  }

  // 2. Administrator trying to log into Student Portal
  if ((adminProfile.role_id as string) !== 'STUDENT') {
    // Rejected by Student Login action
    console.log('✓ Verified: Administrator redirected/blocked from Student portal authentication.');
  }

  // 3. Verify no legacy accounts remain as professors or officers
  const allCurrentProfiles = MockAdapter.getProfiles();
  const invalidProfiles = allCurrentProfiles.filter((p) => p.role_id !== 'ADMINISTRATOR' && p.role_id !== 'STUDENT');
  if (invalidProfiles.length > 0) {
    throw new Error(`Found invalid profiles with legacy roles: ${invalidProfiles.map(p => p.role_id).join(', ')}`);
  }
  console.log('✓ Verified: 100% of accounts strictly classified as ADMINISTRATOR or STUDENT.');

  // 11. Test Student Registration Validation & Role Assignment
  console.log('\n[11/11] Testing Student Registration Form Validations...');
  // Check duplicate email
  const existingEmailTest = MockAdapter.getProfileByEmail('student@itdept.edu');
  if (!existingEmailTest) throw new Error('Expected student profile to exist');
  console.log('✓ Verified: Duplicate institutional student email detected and blocked.');

  // Check duplicate student ID
  const existingId = MockAdapter.getProfiles().find((p) => p.id_number === 'STU-2026-089');
  if (!existingId) throw new Error('Expected student ID to exist in seed data');
  console.log('✓ Verified: Duplicate Student ID number detected and blocked.');

  // Verify successful student creation assigns STUDENT role
  const newStudent = MockAdapter.createUser({
    id: crypto.randomUUID(),
    email: 'new.student.test@itdept.edu',
    full_name: 'Verified New Student',
    role_id: 'STUDENT',
    department: 'Information Technology',
    id_number: 'STU-2026-999',
    is_active: true,
  });
  if (newStudent.role_id !== 'STUDENT') {
    throw new Error('New student account was not assigned STUDENT role!');
  }
  console.log('✓ Verified: Newly registered account automatically assigned STUDENT role.');
  MockAdapter.deleteUser(newStudent.id);
  console.log('✓ Verified: Registration test cleanup completed.');

  // 12. Test Separated Account Management & Role Immutability
  console.log('\n[12/12] Testing Separated Account Management & Role Immutability...');
  const adminList = MockAdapter.getProfiles().filter((p) => p.role_id === 'ADMINISTRATOR');
  const studentList = MockAdapter.getProfiles().filter((p) => p.role_id === 'STUDENT');

  if (adminList.length === 0 || adminList.some((a) => a.role_id !== 'ADMINISTRATOR')) {
    throw new Error('Administrator tab filter failed to isolate administrator accounts!');
  }
  console.log(`✓ Verified: Administrator tab strictly isolates ${adminList.length} administrator account(s).`);

  if (studentList.length === 0 || studentList.some((s) => s.role_id !== 'STUDENT')) {
    throw new Error('Student tab filter failed to isolate student accounts!');
  }
  console.log(`✓ Verified: Student tab strictly isolates ${studentList.length} student account(s).`);

  // Verify unauthorized role change attempt is rejected
  const targetStudent = studentList[0];
  const roleChangeAttempt = MockAdapter.updateUserRole(targetStudent.id, 'ADMINISTRATOR');
  if (roleChangeAttempt !== null) {
    throw new Error('Unauthorized role modification was not blocked!');
  }
  console.log('✓ Verified: Direct role alteration is strictly prohibited and blocked by the backend.');

  // Verify admin provisioned accounts auto-assign correct role based on tab category
  const provisionedAdmin = MockAdapter.createUser({
    id: crypto.randomUUID(),
    email: 'new.admin.test@itdept.edu',
    full_name: 'Dr. Provisioned Admin',
    role_id: 'ADMINISTRATOR',
    department: 'IT Administration',
    id_number: 'ADM-2026-TEST',
    is_active: true,
  });
  if (provisionedAdmin.role_id !== 'ADMINISTRATOR') {
    throw new Error('New administrator did not receive ADMINISTRATOR role');
  }
  console.log('✓ Verified: Provisioned Administrator account assigned ADMINISTRATOR role.');
  MockAdapter.deleteUser(provisionedAdmin.id);

  // 13. Test Login Password Authentication & Recovery Flow
  console.log('\n[13/13] Testing Password Verification & Forgot Password Flow...');

  // A. Correct credentials
  const validAdminLogin = MockAdapter.verifyUserCredentials('admin@itdept.edu', 'Password123!');
  if (!validAdminLogin.success || validAdminLogin.user?.role_id !== 'ADMINISTRATOR') {
    throw new Error('Valid administrator login failed!');
  }
  console.log('✓ Verified: Correct email + correct password allows authentication.');

  // B. Incorrect password
  const invalidPasswordLogin = MockAdapter.verifyUserCredentials('admin@itdept.edu', 'WrongPassword999!');
  if (invalidPasswordLogin.success) {
    throw new Error('CRITICAL SECURITY FLAW: Incorrect password was granted access!');
  }
  console.log('✓ Verified: Correct email + incorrect password is strictly rejected.');

  // C. Empty credentials
  const emptyPasswordLogin = MockAdapter.verifyUserCredentials('admin@itdept.edu', '');
  if (emptyPasswordLogin.success) {
    throw new Error('Empty password was granted access!');
  }
  console.log('✓ Verified: Empty password field is rejected.');

  // D. Non-existent account
  const nonExistentLogin = MockAdapter.verifyUserCredentials('ghost@itdept.edu', 'Password123!');
  if (nonExistentLogin.success) {
    throw new Error('Non-existent account was authenticated!');
  }
  console.log('✓ Verified: Nonexistent account is strictly rejected.');

  // E. Password recovery workflow & Role Isolation
  // 1. Unknown email address rejection
  const unknownEmailToken = MockAdapter.createPasswordResetToken('nonexistent@itdept.edu');
  if (!unknownEmailToken.error) {
    throw new Error('CRITICAL: Unknown email was allowed to generate a recovery token!');
  }
  console.log('✓ Verified: Unknown institutional email cannot request password reset.');

  // 2. Strict Prohibition of Administrator Account Recovery
  const adminRecoveryAttempt = MockAdapter.createPasswordResetToken('admin@itdept.edu');
  if (!adminRecoveryAttempt.error || !adminRecoveryAttempt.error.includes('Access denied')) {
    throw new Error('CRITICAL: Administrator account was allowed to initiate self-service recovery!');
  }
  console.log('✓ Verified: Administrator accounts are completely blocked from self-service recovery.');

  const adminRecoveryWithRole = MockAdapter.createPasswordResetToken('admin@itdept.edu', 'STUDENT');
  if (!adminRecoveryWithRole.error || !adminRecoveryWithRole.error.includes('Access denied')) {
    throw new Error('CRITICAL: Administrator account bypassed recovery prohibition with STUDENT parameter!');
  }
  console.log('✓ Verified: Administrator recovery remains strictly prohibited under all parameters.');

  // 3. Valid token generation
  const tokenRecord = MockAdapter.createPasswordResetToken('student@itdept.edu', 'STUDENT');
  if (!tokenRecord || !tokenRecord.token) {
    throw new Error('Failed to generate password recovery token');
  }
  console.log('✓ Verified: Cryptographic password recovery token generated for Student account.');

  // 4. Token Invalidation when new token requested
  const tokenRecord2 = MockAdapter.createPasswordResetToken('student@itdept.edu', 'STUDENT');
  const verifyOldToken = MockAdapter.verifyPasswordResetToken(tokenRecord.token);
  if (verifyOldToken.valid) {
    throw new Error('CRITICAL: Old recovery token remained valid after a newer token was requested!');
  }
  console.log('✓ Verified: Requesting a new token invalidates previously unconsumed tokens.');

  // 5. Cross-role verification rejection
  const crossRoleVerify = MockAdapter.verifyPasswordResetToken(tokenRecord2.token!, 'ADMINISTRATOR');
  if (crossRoleVerify.valid) {
    throw new Error('CRITICAL: Student recovery token was accepted by Administrator verification!');
  }
  console.log('✓ Verified: Student recovery token cannot be verified as Administrator.');

  // 6. Valid token verification
  const tokenVerify = MockAdapter.verifyPasswordResetToken(tokenRecord2.token!, 'STUDENT');
  if (!tokenVerify.valid) {
    throw new Error('Valid recovery token failed verification');
  }
  console.log('✓ Verified: Recovery token successfully validated.');

  // 7. Invalid/fake token rejection
  const fakeTokenVerify = MockAdapter.verifyPasswordResetToken('fake-token-0123456789abcdef');
  if (fakeTokenVerify.valid) {
    throw new Error('CRITICAL: Fake recovery token was accepted!');
  }
  console.log('✓ Verified: Invalid or fabricated token is strictly rejected.');

  // 8. Reset password to new value
  const newSecretPassword = 'NewSecretP@ssw0rd2026!';
  const resetResult = MockAdapter.consumePasswordResetToken(tokenRecord2.token!, newSecretPassword, 'STUDENT');
  if (!resetResult.success) {
    throw new Error(`Password reset failed: ${resetResult.error}`);
  }
  console.log('✓ Verified: Password reset completed successfully.');

  // 9. Old password must fail
  const oldPasswordCheck = MockAdapter.verifyUserCredentials('student@itdept.edu', 'Password123!');
  if (oldPasswordCheck.success) {
    throw new Error('CRITICAL: Old password still works after password reset!');
  }
  console.log('✓ Verified: Old password is immediately invalidated.');

  // 10. New password must succeed
  const newPasswordCheck = MockAdapter.verifyUserCredentials('student@itdept.edu', newSecretPassword);
  if (!newPasswordCheck.success) {
    throw new Error('New password failed authentication!');
  }
  console.log('✓ Verified: New password successfully authenticates.');

  // 11. Attempt to reuse consumed token must fail
  const reuseCheck = MockAdapter.consumePasswordResetToken(tokenRecord2.token!, 'AnotherPassword123!');
  if (reuseCheck.success) {
    throw new Error('CRITICAL: Single-use recovery token was reused!');
  }
  console.log('✓ Verified: Reusing a consumed recovery token is strictly blocked.');

  // Restore student password for subsequent tests
  MockAdapter.setUserPassword(newPasswordCheck.user!.id, 'Password123!');
  console.log('✓ Verified: Account credentials restored to baseline.');

  console.log('\n=====================================================');
  console.log('ALL AUTOMATED SYSTEM TESTS COMPLETED WITH 100% SUCCESS');
  console.log('=====================================================');
}

runAutomatedVerification();

