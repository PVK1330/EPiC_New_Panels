import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import SuperadminLayout from '../layouts/SuperadminLayout';

import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import CandidateVisaEnquiry from '../pages/candidate/CandidateVisaEnquiry';
import Documents from '../pages/candidate/Documents';
import DocumentChecklist from '../pages/candidate/DocumentChecklist';
import UploadDocuments from '../pages/candidate/UploadDocuments';
import ThirdPartyDocs from '../pages/candidate/ThirdPartyDocs';
import Payments from '../pages/candidate/Payments';
import Communication from '../pages/candidate/Communication';
import Appointments from '../pages/candidate/Appointments';
import Application from '../pages/candidate/Application';
import CandidateMessages from '../pages/candidate/CandidateMessages';
import CandidateNotifications from '../pages/candidate/CandidateNotifications';
import CandidateTasks from '../pages/candidate/CandidateTasks';
import ActivityLog from '../pages/candidate/ActivityLog';
import ApplicationStatus from '../pages/candidate/ApplicationStatus';
import DataCaptureSheet from '../pages/candidate/DataCaptureSheet';
import CandidateCCL from '../pages/candidate/CandidateCCL';
import BiometricAvailability from '../pages/candidate/BiometricAvailability';
import CandidateAccount from '../pages/candidate/CandidateAccount';

import CaseworkerDashboard from '../pages/caseworker/CaseworkerDashboard';
import Cases from '../pages/caseworker/Cases';
import MyAccount from '../pages/caseworker/MyAccount';
import RescheduleForm from '../pages/caseworker/RescheduleForm';
import Calendar from '../pages/caseworker/Calendar';
import Pipeline from '../pages/caseworker/Pipeline';
import Tasks from '../pages/caseworker/Tasks';
import CaseworkerDocuments from '../pages/caseworker/CaseworkerDocuments';
import CaseworkerClients from '../pages/caseworker/CaseworkerClients';
import CaseworkerPerformance from '../pages/caseworker/CaseworkerPerformance';
import CaseworkerMessages from '../pages/caseworker/CaseworkerMessages';
import CaseworkerFinance from '../pages/caseworker/CaseworkerFinance';
import CaseworkerLicenceApplications from '../pages/caseworker/CaseworkerLicenceApplications';
import CaseworkerNotifications from '../pages/caseworker/CaseworkerNotifications';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminCases from '../pages/admin/AdminCases';
import AdminBusinesses from '../pages/admin/AdminBusinesses';
import AdminCandidates from '../pages/admin/AdminCandidates';
import AdminCaseworkers from '../pages/admin/AdminCaseworkers';
import AdminFinance from '../pages/admin/AdminFinance';
import AdminReports from '../pages/admin/AdminReports';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPermissions from '../pages/admin/AdminPermissions';
import AdminCaseDetail from '../pages/admin/AdminCaseDetail';
import AdminPipeline from '../pages/admin/AdminPipeline';
import AdminImmigrationProcess from '../pages/admin/AdminImmigrationProcess';
import AdminAssign from '../pages/admin/AdminAssign';
import AdminEscalations from '../pages/admin/AdminEscalations';
import AdminWorkload from '../pages/admin/AdminWorkload';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminMessages from '../pages/admin/AdminMessages';
import AdminCalendar from '../pages/admin/AdminCalendar';
import AdminLicenceApplications from '../pages/admin/AdminLicenceApplications';
import AdminEnquiryInbox from '../pages/admin/AdminEnquiryInbox';
import AdminCclFeeApprovals from '../pages/admin/AdminCclFeeApprovals';
import AdminAnnouncements from '../pages/admin/AdminAnnouncements';

import BusinessDashboard from '../pages/business/BusinessDashboard';
import BussinessProfile from '../pages/business/BusinessProfile'; import CandidateCalendar from '../pages/candidate/CandidateCalendar';
import BusinessCalendar from '../pages/business/BusinessCalendar';
import BusinessRegistration from '../pages/business/BusinessRegistration';
import KeyPersonnel from '../pages/business/BusinessPersonnel';
import LicenceStatus from '../pages/business/LicenceStatus';
import BusinessAccount from '../pages/business/BusinessAccount';
import BusinessDocuments from '../pages/business/BusinessDocuments';
import LicenceProcess from '../pages/business/LicenceProcess';
import SponsoredWorkerForm from '../pages/business/SponsoredWorkerForm';
import BusinessCompliance from '../pages/business/BusinessCompliance';
import CosRegistrationForm from '../pages/business/Cosregistration';
import SponsorWorkerDetails from '../pages/business/SponsoredWorkerDetails';
import CosAllocationpage from '../pages/business/CosPage';
import Compliacedocument from '../pages/business/Compliacedocument';
import BusinessMessages from '../pages/business/BusinessMessages';
import BusinessNotifications from '../pages/business/BusinessNotifications';
import BusinessPayment from '../pages/business/BusinessPayment';
import BusinessWorkers from '../pages/business/BusinessWorkers';
import BusinessSettings from '../pages/business/BusinessSettings';
import ReportingObligations from '../pages/business/ReportingObligations';
import EmployeeRecords from '../pages/business/EmployeeRecords';
import Invoices from '../pages/business/Invoices';
import Reports from '../pages/business/Reports';
import ApplyLicence from '../pages/business/ApplyLicence';
import LicenceDocuments from '../pages/business/LicenceDocuments';

// Superadmin Pages
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


import NotFoundPage from '../pages/NotFoundPage';
import { getDashboardRouteForUser } from '../utils/authResponse';

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
  const { user, token } = useSelector((state) => state.auth);

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route
          path="/login"
          element={token && user ? <Navigate to={getDashboardRouteForUser(user)} replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token && user ? <Navigate to={getDashboardRouteForUser(user)} replace /> : <RegisterPage />}
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
            token && user
              ? <Navigate to={getDashboardRouteForUser(user)} replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
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
          <Route path="documents" element={<Navigate to="/candidate/document-checklist" replace />} />
          <Route path="document-checklist" element={<DocumentChecklist />} />
          <Route path="upload-documents" element={<UploadDocuments />} />
          <Route path="third-party-docs" element={<ThirdPartyDocs />} />
          <Route path="documents-legacy" element={<Documents />} />
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
          <Route path="licence-documents" element={<LicenceDocuments />} />
          <Route path="profile" element={<BussinessProfile />} />
          <Route path="personnel" element={<KeyPersonnel />} />
          <Route path="licence" element={<LicenceStatus />} />
          <Route path="business-registration" element={<BusinessRegistration />} />
          <Route path="compliance-documents" element={<Compliacedocument />} />
          <Route path="compliance" element={<BusinessCompliance />} />
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
