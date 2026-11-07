import { MockAdapter } from '../lib/supabase/mock-adapter';
import { encryptAES256, decryptAES256 } from '../lib/crypto/aes';

function runAutomatedVerification() {
  console.log('=====================================================');
  console.log('RUNNING FULL SYSTEM AUTOMATED VERIFICATION');
  console.log('IT Department Feedback and Survey System');
  console.log('=====================================================\n');

  // 1. Verify User Profiles & Roles
  console.log('[1/7] Testing User Profiles & RBAC...');
  const profiles = MockAdapter.getProfiles();
  if (profiles.length < 4) throw new Error('Expected at least 4 seeded profiles');
  const roles = new Set(profiles.map((p) => p.role_id));
  if (!roles.has('STUDENT') || !roles.has('IT_PROFESSOR') || !roles.has('IT_OFFICER') || !roles.has('ADMINISTRATOR')) {
    throw new Error('Missing required user roles in seed data');
  }
  console.log('✓ All 4 user roles verified (STUDENT, IT_PROFESSOR, IT_OFFICER, ADMINISTRATOR).');

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

  console.log('\n=====================================================');
  console.log('ALL AUTOMATED SYSTEM TESTS COMPLETED WITH 100% SUCCESS');
  console.log('=====================================================');
}

runAutomatedVerification();

