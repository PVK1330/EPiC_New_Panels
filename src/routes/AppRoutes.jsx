import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminLayout from "../layouts/AdminLayout";
import CandidateLayout from "../layouts/CandidateLayout";
import CaseworkerLayout from "../layouts/CaseworkerLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";

// Candidate Pages
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import Documents from "../pages/candidate/Documents";
import DocumentChecklist from "../pages/candidate/DocumentChecklist";
import UploadDocuments from "../pages/candidate/UploadDocuments";
import ThirdPartyDocs from "../pages/candidate/ThirdPartyDocs";
import Payments from "../pages/candidate/Payments";
import Communication from "../pages/candidate/Communication";
import Appointments from "../pages/candidate/Appointments";
import Application from "../pages/candidate/Application";
import CandidateMessages from "../pages/candidate/CandidateMessages";
import CandidateNotifications from "../pages/candidate/CandidateNotifications";

import ActivityLog from "../pages/candidate/ActivityLog";
import ApplicationStatus from "../pages/candidate/ApplicationStatus";
import CandidateAccount from "../pages/candidate/CandidateAccount";

import CaseworkerDashboard from "../pages/caseworker/CaseworkerDashboard";
import Cases from "../pages/caseworker/Cases";
import MyAccount from "../pages/caseworker/MyAccount";
import RescheduleForm from "../pages/caseworker/RescheduleForm";
import CaseworkerPlaceholderPage from "../pages/caseworker/CaseworkerPlaceholderPage";
import Pipeline from "../pages/caseworker/Pipeline";
import Tasks from "../pages/caseworker/Tasks";
import CaseworkerDocuments from "../pages/caseworker/CaseworkerDocuments";
import CaseworkerClients from "../pages/caseworker/CaseworkerClients";
import CaseworkerPerformance from "../pages/caseworker/CaseworkerPerformance";
import CaseworkerMessages from "../pages/caseworker/CaseworkerMessages";
import CaseworkerFinance from "../pages/caseworker/CaseworkerFinance";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCases from "../pages/admin/AdminCases";
import AdminBusinesses from "../pages/admin/AdminBusinesses";
import AdminCandidates from "../pages/admin/AdminCandidates";
import AdminCaseworkers from "../pages/admin/AdminCaseworkers";
import AdminFinance from "../pages/admin/AdminFinance";
import AdminReports from "../pages/admin/AdminReports";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminPermissions from "../pages/admin/AdminPermissions";
import AdminCaseDetail from "../pages/admin/AdminCaseDetail";
import AdminPipeline from "../pages/admin/AdminPipeline";
import AdminAssign from "../pages/admin/AdminAssign";
import AdminEscalations from "../pages/admin/AdminEscalations";
import AdminWorkload from "../pages/admin/AdminWorkload";
import AdminDocuments from "../pages/admin/AdminDocuments";
import AdminMessages from "../pages/admin/AdminMessages";
import BusinessLayout from "../layouts/BusinessLayout";

// Business Pages
import BusinessDashboard from "../pages/business/BusinessDashboard";
import BusinessProfile from "../pages/business/BusinessProfile";
import BusinessPersonnel from "../pages/business/BusinessPersonnel";
import LicenceStatus from "../pages/business/LicenceStatus";
import CosPage from "../pages/business/CosPage";
import BusinessWorkers from "../pages/business/BusinessWorkers";
import BusinessDocuments from "../pages/business/BusinessDocuments";
import BusinessMessages from "../pages/business/BusinessMessages";
import BusinessNotifications from "../pages/business/BusinessNotifications";
import BusinessAccount from "../pages/business/BusinessAccount";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardMap = {
      admin: "/admin/dashboard",
      candidate: "/candidate/dashboard",
      caseworker: "/caseworker/dashboard",
      business: "/business/dashboard",
      staff: "/staff/dashboard",
      agent: "/agent/dashboard",
    };
    const target = dashboardMap[user.role] || "/login";

    // Check if we are already at the target to prevent infinite loop
    const currentPath = window.location.pathname.replace(/\/$/, "");
    const targetPath = target.replace(/\/$/, "");

    if (currentPath === targetPath) {
      return children;
    }

    return <Navigate to={target} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token && user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Root redirection based on role */}
      <Route
        path="/"
        element={
          token && user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/dashboard" element={<Navigate to="/" replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="cases" element={<AdminCases />} />
        <Route path="businesses" element={<AdminBusinesses />} />
        <Route path="candidates" element={<AdminCandidates />} />
        <Route path="caseworkers" element={<AdminCaseworkers />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
        {/* New pages */}
        <Route path="admin-users" element={<AdminUsers />} />
        <Route path="permissions" element={<AdminPermissions />} />
        <Route path="case-detail/:caseId?" element={<AdminCaseDetail />} />
        <Route path="pipeline" element={<AdminPipeline />} />
        <Route path="assign" element={<AdminAssign />} />
        <Route path="escalations" element={<AdminEscalations />} />
        <Route path="workload" element={<AdminWorkload />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      {/* Candidate Routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="application" element={<Application />} />
        <Route
          path="documents"
          element={<Navigate to="/candidate/document-checklist" replace />}
        />
        <Route path="document-checklist" element={<DocumentChecklist />} />
        <Route path="upload-documents" element={<UploadDocuments />} />
        <Route path="third-party-docs" element={<ThirdPartyDocs />} />
        <Route path="documents-legacy" element={<Documents />} />
        <Route path="payments" element={<Payments />} />
        <Route
          path="payment-summary"
          element={<Navigate to="/candidate/payments" replace />}
        />
        <Route
          path="payment-history"
          element={<Navigate to="/candidate/payments?tab=history" replace />}
        />
        <Route path="communication" element={<Communication />} />
        <Route path="messages" element={<CandidateMessages />} />
        <Route path="notifications" element={<CandidateNotifications />} />
        <Route path="appointments" element={<Appointments />} />

        <Route path="activity-log" element={<ActivityLog />} />
        <Route path="application-status" element={<ApplicationStatus />} />
        <Route
          path="timeline"
          element={
            <Navigate to="/candidate/application-status?tab=timeline" replace />
          }
        />
        <Route
          path="pending-actions"
          element={
            <Navigate
              to="/candidate/application-status?tab=actions"
              replace
            />
          }
        />
        <Route path="account" element={<CandidateAccount />} />
        <Route
          path="application-pack"
          element={<Navigate to="/candidate/account" replace />}
        />
        <Route
          path="final-documents"
          element={
            <Navigate to="/candidate/account?tab=downloads&section=final" replace />
          }
        />
        <Route
          path="feedback"
          element={<Navigate to="/candidate/account?tab=feedback" replace />}
        />
        <Route
          path="profile-settings"
          element={<Navigate to="/candidate/account?tab=profile" replace />}
        />
      </Route>

      {/* Caseworker Routes */}
      <Route
        path="/caseworker"
        element={
          <ProtectedRoute allowedRoles={["caseworker"]}>
            <CaseworkerLayout />
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
        <Route
          path="calendar"
          element={<CaseworkerPlaceholderPage title="Calendar" />}
        />
        <Route path="documents/upload" element={<CaseworkerDocuments />} />
        <Route path="documents/missing" element={<CaseworkerDocuments />} />
        <Route
          path="people/candidates"
          element={<CaseworkerClients />}
        />
        <Route
          path="people/sponsors"
          element={<CaseworkerClients />}
        />
        <Route
          path="messages"
          element={<CaseworkerMessages />}
        />
        <Route
          path="finance"
          element={<CaseworkerFinance />}
        />
        <Route path="performance" element={<CaseworkerPerformance />} />
      </Route>

      {/* Business Routes */}
      <Route
        path="/business"
        element={
          <ProtectedRoute allowedRoles={["business"]}>
            <BusinessLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BusinessDashboard />} />
        <Route path="profile" element={<BusinessProfile />} />
        <Route path="personnel" element={<BusinessPersonnel />} />
        <Route path="licence" element={<LicenceStatus />} />
        <Route path="cosallocation" element={<CosPage />} />
        <Route path="workers" element={<BusinessWorkers />} />
        <Route path="compliance" element={<BusinessDocuments />} />
        <Route path="reports" element={<BusinessDocuments />} />
        <Route path="messages" element={<BusinessMessages />} />
        <Route path="notifications" element={<BusinessNotifications />} />
        <Route path="settings" element={<BusinessAccount />} />
      </Route>

      {/* Staff Routes (Placeholder) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <div className="p-8">
              <Outlet />
            </div>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <div className="text-center">
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
              <p className="text-gray-500">Portal coming soon</p>
            </div>
          }
        />
      </Route>

      {/* Agent Routes (Placeholder) */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={["agent"]}>
            <div className="p-8">
              <Outlet />
            </div>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <div className="text-center">
              <h1 className="text-2xl font-bold">Agent Dashboard</h1>
              <p className="text-gray-500">Portal coming soon</p>
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
