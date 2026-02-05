import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Groups from "./pages/Groups.jsx";
import GroupDetails from "./pages/GroupDetails.jsx";
import EditGroup from "./components/EditGroup.jsx";
import Emails from "./pages/Emails.jsx";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile.jsx";
import UniversalAdminDashboard from "./pages/UniversalAdminDashboard";
import UniversitiesManagement from "./pages/UniversitiesManagement";
import UniversityDetails from "./pages/UniversityDetails";

import AdminRequestsManagement from "./pages/AdminRequestsManagement.jsx";
import MyAdminRequests from "./pages/MyAdminRequests.jsx";
import UniversityRegistrationRequests from "./pages/UniversityRegistrationRequests.jsx";
import UniversityRequestsManagement from "./pages/UniversityRequestsManagement.jsx";

/* ---------- PROTECTED ROUTE WRAPPER ---------- */

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuth, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-black text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Changed from normalizedRole comparison
  if (adminOnly && user?.role !== "UniversalAdmin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ---------- LOGIN ROUTE WRAPPER ---------- */

function LoginRoute() {
  const { isAuth, loading, user } = useAuth();
  const normalizedRole = user?.role?.toLowerCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-black text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (isAuth) {
    // Changed from "universaladmin" to match your backend
    if (user?.role === "UniversalAdmin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

/* ---------- HOME ROUTE WRAPPER ---------- */

function HomeRoute() {
  const { isAuth, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-black text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Changed from normalizedRole comparison
  if (user?.role === "UniversalAdmin") {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
}

/* ---------- ROOT LAYOUT ---------- */

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

/* ---------- ROUTER ---------- */

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "login",
        element: <LoginRoute />,
      },
      {
        path: "signup",
        element: (
            <Signup />
        ),
      },
      {
        path: "/",
        element: <HomeRoute />,
      },
      {
        path: "groups",
        element: (
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:id",
        element: (
          <ProtectedRoute>
            <GroupDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:id/edit",
        element: (
          <ProtectedRoute>
            <EditGroup />
          </ProtectedRoute>
        ),
      },
      {
        path: "emails",
        element: (
          <ProtectedRoute>
            <Emails />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-admin-requests",
        element: (
          <ProtectedRoute>
            <MyAdminRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: "university-requests",
        element: (
          <ProtectedRoute>
            <UniversityRegistrationRequests />
          </ProtectedRoute>
        ),
      },
      // Admin routes
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly>
            <UniversalAdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/requests",
        element: (
          <ProtectedRoute adminOnly>
            <AdminRequestsManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/university-requests",
        element: (
          <ProtectedRoute adminOnly>
            <UniversityRequestsManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/universities",
        element: (
          <ProtectedRoute adminOnly>
            <UniversitiesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/universities/:id",
        element: (
          <ProtectedRoute adminOnly>
            <UniversityDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}