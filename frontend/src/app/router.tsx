import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminRoute } from "@/features/admin/AdminRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const AcademicResultsPage = lazy(() => import("@/features/results/AcademicResultsPage"));
const BacklogReportPage = lazy(() => import("@/features/backlog/BacklogReportPage"));
const ClassResultsPage = lazy(() => import("@/features/class-results/ClassResultsPage"));
const CreditsAnalyzerPage = lazy(() => import("@/features/credits/CreditsAnalyzerPage"));
const CreditsComparePage = lazy(() => import("@/features/credits/CreditsComparePage"));
const ResultComparePage = lazy(() => import("@/features/compare/ResultComparePage"));
const PerformanceTrendsPage = lazy(() => import("@/features/trends/PerformanceTrendsPage"));
const NotificationsPage = lazy(() => import("@/features/notifications/NotificationsPage"));
const HelpCenterPage = lazy(() => import("@/features/help/HelpCenterPage"));
const AdminLoginPage = lazy(() => import("@/features/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/features/admin/AdminDashboardPage"));
const AdminFeedbackPage = lazy(() => import("@/features/admin/AdminFeedbackPage"));
const AdminUsersPage = lazy(() => import("@/features/admin/AdminUsersPage"));
const AdminFooterPage = lazy(() => import("@/features/admin/AdminFooterPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "academic-results", element: <AcademicResultsPage /> },
      { path: "backlog-report", element: <BacklogReportPage /> },
      { path: "class-results", element: <ClassResultsPage /> },
      { path: "credits-analyzer", element: <CreditsAnalyzerPage /> },
      { path: "credits-compare", element: <CreditsComparePage /> },
      { path: "result-compare", element: <ResultComparePage /> },
      { path: "performance-trends", element: <PerformanceTrendsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "help-center", element: <HelpCenterPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "feedback", element: <AdminFeedbackPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "footer", element: <AdminFooterPage /> },
        ],
      },
    ],
  },
]);
