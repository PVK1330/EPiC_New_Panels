import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import RequireAdminModule from './RequireAdminModule';
import AdminLayout from '../layouts/AdminLayout';
import SuperadminLayout from '../layouts/SuperadminLayout';
import NotFoundPage from '../pages/NotFoundPage';
import { getDashboardRouteForUser } from '../utils/authResponse';
import { useAuthContext } from '../context/AuthContext';

// ── Candidate pages ──────────────────────────────────────────────────────────
const CandidateDashboard = lazy(() => import('../pages/candidate/CandidateDashboard'));
const CandidateVisaEnquiry = lazy(() => import('../pages/candidate/CandidateVisaEnquiry'));
const Documents = lazy(() => import('../pages/candidate/Documents'));
const DocumentChecklist = lazy(() => import('../pages/candidate/DocumentChecklist'));
const UploadDocuments = lazy(() => import('../pages/candidate/UploadDocuments'));
const ThirdPartyDocs = lazy(() => import('../pages/candidate/ThirdPartyDocs'));
const Payments = lazy(() => import('../pages/candidate/Payments'));
const Communication = lazy(() => import('../pages/candidate/Communication'));
const Appointments = lazy(() => import('../pages/candidate/Appointments'));
const Application = lazy(() => import('../pages/candidate/Application'));
const CandidateMessages = lazy(() => import('../pages/candidate/CandidateMessages'));
const CandidateNotifications = lazy(() => import('../pages/candidate/CandidateNotifications'));
const CandidateTasks = lazy(() => import('../pages/candidate/CandidateTasks'));
const ActivityLog = lazy(() => import('../pages/candidate/ActivityLog'));
const ApplicationStatus = lazy(() => import('../pages/candidate/ApplicationStatus'));
const DataCaptureSheet = lazy(() => import('../pages/candidate/DataCaptureSheet'));
const CandidateCCL = lazy(() => import('../pages/candidate/CandidateCCL'));
const BiometricAvailability = lazy(() => import('../pages/candidate/BiometricAvailability'));
const CandidateAccount = lazy(() => import('../pages/candidate/CandidateAccount'));
const CandidateCalendar = lazy(() => import('../pages/candidate/CandidateCalendar'));

// ── Caseworker pages ─────────────────────────────────────────────────────────
const CaseworkerDashboard = lazy(() => import('../pages/caseworker/CaseworkerDashboard'));
const Cases = lazy(() => import('../pages/caseworker/Cases'));
const MyAccount = lazy(() => import('../pages/caseworker/MyAccount'));
const RescheduleForm = lazy(() => import('../pages/caseworker/RescheduleForm'));
const Calendar = lazy(() => import('../pages/caseworker/Calendar'));
const Pipeline = lazy(() => import('../pages/caseworker/Pipeline'));
const Tasks = lazy(() => import('../pages/caseworker/Tasks'));
const CaseworkerDocuments = lazy(() => import('../pages/caseworker/CaseworkerDocuments'));
const CaseworkerClients = lazy(() => import('../pages/caseworker/CaseworkerClients'));
const CaseworkerPerformance = lazy(() => import('../pages/caseworker/CaseworkerPerformance'));
const CaseworkerMessages = lazy(() => import('../pages/caseworker/CaseworkerMessages'));
const CaseworkerFinance = lazy(() => import('../pages/caseworker/CaseworkerFinance'));
const CaseworkerLicenceApplications = lazy(() => import('../pages/caseworker/CaseworkerLicenceApplications'));
const CaseworkerCosRequests = lazy(() => import('../pages/caseworker/CaseworkerCosRequests'));
const CaseworkerComplianceReview = lazy(() => import('../pages/caseworker/CaseworkerComplianceReview'));
const CaseworkerNotifications = lazy(() => import('../pages/caseworker/CaseworkerNotifications'));
const CaseworkerCclTemplates = lazy(() => import('../pages/caseworker/CaseworkerCclTemplates'));

// ── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminCases = lazy(() => import('../pages/admin/AdminCases'));
const AdminBusinesses = lazy(() => import('../pages/admin/AdminBusinesses'));
const AdminCandidates = lazy(() => import('../pages/admin/AdminCandidates'));
const AdminCaseworkers = lazy(() => import('../pages/admin/AdminCaseworkers'));
const AdminFinance = lazy(() => import('../pages/admin/AdminFinance'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminPermissions = lazy(() => import('../pages/admin/AdminPermissions'));
const AdminCaseDetail = lazy(() => import('../pages/admin/AdminCaseDetail'));
const AdminPipeline = lazy(() => import('../pages/admin/AdminPipeline'));
const AdminImmigrationProcess = lazy(() => import('../pages/admin/AdminImmigrationProcess'));
const AdminAssign = lazy(() => import('../pages/admin/AdminAssign'));
const AdminEscalations = lazy(() => import('../pages/admin/AdminEscalations'));
const AdminWorkload = lazy(() => import('../pages/admin/AdminWorkload'));
const AdminDepartments = lazy(() => import('../pages/admin/AdminDepartments'));
const AdminDocuments = lazy(() => import('../pages/admin/AdminDocuments'));
const AdminMessages = lazy(() => import('../pages/admin/AdminMessages'));
const AdminCalendar = lazy(() => import('../pages/admin/AdminCalendar'));
const AdminLicenceApplications = lazy(() => import('../pages/admin/AdminLicenceApplications'));
const AdminCosRequests = lazy(() => import('../pages/admin/AdminCosRequests'));
const AdminComplianceReview = lazy(() => import('../pages/admin/AdminComplianceReview'));
const AdminEnquiryInbox = lazy(() => import('../pages/admin/AdminEnquiryInbox'));
const AdminCclFeeApprovals = lazy(() => import('../pages/admin/AdminCclFeeApprovals'));
const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements'));
const AdminActivityCenter = lazy(() => import('../pages/admin/ActivityCenter'));
const AdminTimelineExplorer = lazy(() => import('../pages/admin/TimelineExplorer'));
const AdminChangeRequests = lazy(() => import('../pages/admin/ChangeRequests'));
const AdminUserActivity = lazy(() => import('../pages/admin/UserActivity'));
const AdminLoginActivity = lazy(() => import('../pages/admin/LoginActivity'));
const AdminSubscription = lazy(() => import('../pages/admin/AdminSubscription'));

// ── Business pages ───────────────────────────────────────────────────────────
const BusinessDashboard = lazy(() => import('../pages/business/BusinessDashboard'));
const BussinessProfile = lazy(() => import('../pages/business/BusinessProfile'));
const BusinessCalendar = lazy(() => import('../pages/business/BusinessCalendar'));
const BusinessRegistration = lazy(() => import('../pages/business/BusinessRegistration'));
const KeyPersonnel = lazy(() => import('../pages/business/BusinessPersonnel'));
const LicenceStatus = lazy(() => import('../pages/business/LicenceStatus'));
const BusinessAccount = lazy(() => import('../pages/business/BusinessAccount'));
const BusinessDocuments = lazy(() => import('../pages/business/BusinessDocuments'));
const LicenceProcess = lazy(() => import('../pages/business/LicenceProcess'));
const SponsoredWorkerForm = lazy(() => import('../pages/business/SponsoredWorkerForm'));
const BusinessCompliance = lazy(() => import('../pages/business/BusinessCompliance'));
const CosRegistrationForm = lazy(() => import('../pages/business/Cosregistration'));
const SponsorWorkerDetails = lazy(() => import('../pages/business/SponsoredWorkerDetails'));
const CosAllocationpage = lazy(() => import('../pages/business/CosPage'));
const Compliacedocument = lazy(() => import('../pages/business/Compliacedocument'));
const ComplianceReviewStatus = lazy(() => import('../pages/business/ComplianceReviewStatus'));
const ComplianceMonthlyReview = lazy(() => import('../pages/business/ComplianceMonthlyReview'));
const BusinessMessages = lazy(() => import('../pages/business/BusinessMessages'));
const BusinessNotifications = lazy(() => import('../pages/business/BusinessNotifications'));
const BusinessPayment = lazy(() => import('../pages/business/BusinessPayment'));
const BusinessWorkers = lazy(() => import('../pages/business/BusinessWorkers'));
const BusinessSettings = lazy(() => import('../pages/business/BusinessSettings'));
const ReportingObligations = lazy(() => import('../pages/business/ReportingObligations'));
const EmployeeRecords = lazy(() => import('../pages/business/EmployeeRecords'));
const Invoices = lazy(() => import('../pages/business/Invoices'));
const Reports = lazy(() => import('../pages/business/Reports'));
const ApplyLicence = lazy(() => import('../pages/business/ApplyLicence'));
const ApplyLicenceV2 = lazy(() => import('../pages/business/ApplyLicenceV2'));
const LicenceApplicationV2Detail = lazy(() => import('../components/licence/LicenceApplicationV2Detail'));
const LicenceDocuments = lazy(() => import('../pages/business/LicenceDocuments'));
const BusinessTasks = lazy(() => import('../pages/business/BusinessTasks'));
// Section K — Multi-Company Handling
const LinkedEntities = lazy(() => import('../pages/business/LinkedEntities'));
// Section H — Right to Work
const RightToWork = lazy(() => import('../pages/business/RightToWork'));
// Section O — Sponsor Audit Log
const BusinessAuditLog = lazy(() => import('../pages/business/BusinessAuditLog'));

// ── Superadmin pages ─────────────────────────────────────────────────────────
const SuperadminDashboard = lazy(() => import('../pages/superadmin/SuperadminDashboard'));
const SuperadminOrganisations = lazy(() => import('../pages/superadmin/SuperadminOrganisations'));
const SuperadminPlans = lazy(() => import('../pages/superadmin/SuperadminPlans'));
const SuperadminBilling = lazy(() => import('../pages/superadmin/SuperadminBilling'));
const SuperadminAuditLog = lazy(() => import('../pages/superadmin/SuperadminAuditLog'));
const SuperadminSettings = lazy(() => import('../pages/superadmin/SuperadminSettings'));
const SuperadminPayments = lazy(() => import('../pages/superadmin/SuperadminPayments'));
const SuperadminTeam = lazy(() => import('../pages/superadmin/SuperadminTeam'));
const SuperadminFrontend = lazy(() => import('../pages/superadmin/SuperadminFrontend'));
const SuperadminProfile = lazy(() => import('../pages/superadmin/SuperadminProfile'));
const SuperadminNotifications = lazy(() => import('../pages/superadmin/SuperadminNotifications'));
const SuperadminAnnouncements = lazy(() => import('../pages/superadmin/SuperadminAnnouncements'));
const SuperadminGDPR = lazy(() => import('../pages/superadmin/SuperadminGDPR'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const VerifyOtpPage = lazy(() => import('../pages/auth/VerifyOtpPage'));
const TwoFactorPage = lazy(() => import('../pages/auth/TwoFactorPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const VerifyResetOtpPage = lazy(() => import('../pages/auth/VerifyResetOtpPage'));
const SetPasswordPage = lazy(() => import('../pages/auth/SetPasswordPage'));
const AuthHandoffPage = lazy(() => import('../pages/auth/AuthHandoffPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRouter = () => {
  const { user } = useSelector((state) => state.auth);
  const { sessionChecked } = useAuthContext();

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={getDashboardRouteForUser(user)} replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={getDashboardRouteForUser(user)} replace /> : <RegisterPage />}
        />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/2fa" element={<TwoFactorPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/auth/handoff" element={<AuthHandoffPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            !sessionChecked
              ? <Fallback />
              : user
                ? <Navigate to={getDashboardRouteForUser(user)} replace />
                : <Navigate to="/login" replace />
          }
        />

        {/* Standalone subscription/renewal page — reachable while the org is
            suspended (outside AdminLayout, which would make gated API calls). */}
        <Route
          path="/admin/subscription"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSubscription />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RequireAdminModule>
                <AdminLayout />
              </RequireAdminModule>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="enquiries" element={<AdminEnquiryInbox />} />
          <Route path="ccl-fee-approvals" element={<AdminCclFeeApprovals />} />
          <Route path="cases" element={<AdminCases />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="caseworkers" element={<AdminCaseworkers />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="case-detail/:caseId?" element={<AdminCaseDetail />} />
          <Route path="pipeline" element={<AdminPipeline />} />
          <Route path="case-process" element={<AdminImmigrationProcess />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="assign" element={<AdminAssign />} />
          <Route path="escalations" element={<AdminEscalations />} />
          <Route path="workload" element={<AdminWorkload />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="licence-requests" element={<AdminLicenceApplications />} />
          <Route path="licence/v2/:id" element={<LicenceApplicationV2Detail role="admin" />} />
          <Route path="cos-requests" element={<AdminCosRequests />} />
          <Route path="compliance-review" element={<AdminComplianceReview />} />
          <Route path="activity-center" element={<AdminActivityCenter />} />
          <Route path="timeline-explorer" element={<AdminTimelineExplorer />} />
          <Route path="change-requests" element={<AdminChangeRequests />} />
          <Route path="user-activity" element={<AdminUserActivity />} />
          <Route path="login-activity" element={<AdminLoginActivity />} />
        </Route>

        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="visa-enquiry" element={<CandidateVisaEnquiry />} />
          <Route path="application" element={<Application />} />
          <Route path="documents" element={<Documents />} />
          <Route path="document-checklist" element={<DocumentChecklist />} />
          <Route path="upload-documents" element={<UploadDocuments />} />
          <Route path="third-party-docs" element={<ThirdPartyDocs />} />
          <Route path="documents-legacy" element={<Navigate to="/candidate/documents" replace />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payment-summary" element={<Navigate to="/candidate/payments" replace />} />
          <Route path="payment-history" element={<Navigate to="/candidate/payments?tab=history" replace />} />
          <Route path="communication" element={<Communication />} />
          <Route path="messages" element={<CandidateMessages />} />
          <Route path="notifications" element={<CandidateNotifications />} />
          <Route path="tasks" element={<CandidateTasks />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="calendar" element={<CandidateCalendar />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="application-status" element={<ApplicationStatus />} />
          <Route path="track-progress" element={<Navigate to="/candidate/application-status" replace />} />
          <Route path="data-capture-sheet" element={<DataCaptureSheet />} />
          <Route path="data-capture" element={<Navigate to="/candidate/data-capture-sheet" replace />} />
          <Route path="ccl" element={<CandidateCCL />} />
          <Route path="biometric-availability" element={<BiometricAvailability />} />
          <Route path="timeline" element={<Navigate to="/candidate/application-status?tab=timeline" replace />} />
          <Route path="pending-actions" element={<Navigate to="/candidate/application-status?tab=actions" replace />} />
          <Route path="account" element={<CandidateAccount />} />
          <Route path="application-pack" element={<Navigate to="/candidate/account" replace />} />
          <Route path="final-documents" element={<Navigate to="/candidate/account?tab=downloads&section=final" replace />} />
          <Route path="feedback" element={<Navigate to="/candidate/account?tab=feedback" replace />} />
          <Route path="profile-settings" element={<Navigate to="/candidate/account?tab=profile" replace />} />
        </Route>

        <Route
          path="/caseworker"
          element={
            <ProtectedRoute allowedRoles={['caseworker']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/caseworker/dashboard" replace />} />
          <Route path="dashboard" element={<CaseworkerDashboard />} />
          <Route path="cases" element={<Cases />} />
          <Route path="ccl-templates" element={<CaseworkerCclTemplates />} />
          <Route path="my-account" element={<MyAccount />} />
          <Route path="reschedule-form" element={<RescheduleForm />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="documents/upload" element={<CaseworkerDocuments />} />
          <Route path="documents/missing" element={<CaseworkerDocuments />} />
          <Route path="people/candidates" element={<CaseworkerClients />} />
          <Route path="people/sponsors" element={<CaseworkerClients />} />
          <Route path="messages" element={<CaseworkerMessages />} />
          <Route path="notifications" element={<CaseworkerNotifications />} />
          <Route path="finance" element={<CaseworkerFinance />} />
          <Route path="performance" element={<CaseworkerPerformance />} />
          <Route path="licence-reviews" element={<CaseworkerLicenceApplications />} />
          <Route path="licence/v2/:id" element={<LicenceApplicationV2Detail role="caseworker" />} />
          <Route path="cos-requests" element={<CaseworkerCosRequests />} />
          <Route path="compliance-review" element={<CaseworkerComplianceReview />} />
        </Route>

        <Route
          path="/business"
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="apply-licence" element={<ApplyLicence />} />
          <Route path="apply-licence-v2" element={<ApplyLicenceV2 />} />
          <Route path="apply-licence-v2/:id" element={<ApplyLicenceV2 />} />
          <Route path="licence-documents" element={<LicenceDocuments />} />
          <Route path="profile" element={<BussinessProfile />} />
          <Route path="personnel" element={<KeyPersonnel />} />
          <Route path="licence" element={<LicenceStatus />} />
          <Route path="business-registration" element={<BusinessRegistration />} />
          <Route path="compliance-documents" element={<Compliacedocument />} />
          <Route path="compliance" element={<BusinessCompliance />} />
          <Route path="compliance-review" element={<ComplianceReviewStatus />} />
          <Route path="cosallocation" element={<CosAllocationpage />} />
          <Route path="account" element={<BusinessAccount />} />
          <Route path="sponsored-workers" element={<SponsoredWorkerForm />} />
          <Route path="cosregistrationform" element={<CosRegistrationForm />} />
          <Route path="worker-details" element={<SponsorWorkerDetails />} />
          <Route path="licence-process" element={<LicenceProcess />} />
          <Route path="admin-licence-view" element={<AdminLicenceApplications />} />
          <Route path="documents" element={<BusinessDocuments />} />
          <Route path="messages" element={<BusinessMessages />} />
          <Route path="notifications" element={<BusinessNotifications />} />
          <Route path="payment" element={<BusinessPayment />} />
          <Route path="workers" element={<BusinessWorkers />} />
          <Route path="settings" element={<BusinessSettings />} />
          <Route path="calendar" element={<BusinessCalendar />} />
          <Route path="reporting-obligations" element={<ReportingObligations />} />
          <Route path="employee-records" element={<EmployeeRecords />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tasks" element={<BusinessTasks />} />
          {/* Section N — Monthly Compliance Review */}
          <Route path="monthly-compliance-review" element={<ComplianceMonthlyReview />} />
          {/* Section K — Multi-Company Handling */}
          <Route path="linked-entities" element={<LinkedEntities />} />
          {/* Section H — Right to Work */}
          <Route path="right-to-work" element={<RightToWork />} />
          {/* Section O — Sponsor Audit Log */}
          <Route path="audit-log" element={<BusinessAuditLog />} />
        </Route>

        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperadminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperadminDashboard />} />
          <Route path="organisations" element={<SuperadminOrganisations />} />
          <Route path="announcements" element={<SuperadminAnnouncements />} />
          <Route path="plans" element={<SuperadminPlans />} />
          <Route path="billing" element={<SuperadminBilling />} />
          <Route path="audit-log" element={<SuperadminAuditLog />} />
          <Route path="gdpr" element={<SuperadminGDPR />} />
          <Route path="settings" element={<SuperadminSettings />} />
          <Route path="notifications" element={<SuperadminNotifications />} />
          <Route path="payments" element={<SuperadminPayments />} />
          <Route path="team" element={<SuperadminTeam />} />
          <Route path="frontend" element={<SuperadminFrontend />} />
          <Route path="profile" element={<SuperadminProfile />} />

        </Route>

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <div className="p-8"><Outlet /></div>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<div className="text-center"><h1 className="text-2xl font-bold">Staff Dashboard</h1><p className="text-gray-500">Portal coming soon</p></div>} />
        </Route>

        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <div className="p-8"><Outlet /></div>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<div className="text-center"><h1 className="text-2xl font-bold">Agent Dashboard</h1><p className="text-gray-500">Portal coming soon</p></div>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
