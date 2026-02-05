import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Groups from './pages/Groups.jsx';
import GroupDetails from "./pages/GroupDetails.jsx";
import EditGroup from "./components/EditGroup.jsx";
import Emails from './pages/Emails.jsx';
import Messages from "./pages/Messages";
import Profile from "./pages/Profile.jsx";
import UniversalAdminDashboard from './pages/UniversalAdminDashboard';
import UniversitiesManagement from './pages/UniversitiesManagement';
import UniversityDetails from './pages/UniversityDetails';
import AdminRequestsManagement from "./pages/AdminRequestsManagement.jsx";
import MyAdminRequests from "./pages/MyAdminRequests.jsx";

function AppRoutes() {
  const { isAuth, loading, user } = useAuth(); // make sure your context provides user info

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-black text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // Redirect UniversalAdmin automatically
  if (isAuth && user?.role === "UniversalAdmin" && window.location.pathname !== "/admin") {
    window.location.href = "/admin";
    return null; // render nothing while redirecting
  }

  return (
    <Routes>
      <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuth ? <Signup /> : <Navigate to="/" />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:id" element={<GroupDetails />} />
      <Route path="/groups/:id/edit" element={<EditGroup />} />
      <Route path="/emails/" element={<Emails />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/profile/" element={<Profile />} />
      {/* Universal Admin route */}
      <Route path="/admin/requests" element={<AdminRequestsManagement />} />
      <Route path="/admin" element={<UniversalAdminDashboard />} />
      <Route path="/admin/universities" element={<UniversitiesManagement />} />
      <Route path="/admin/universities/:id" element={<UniversityDetails />} /> 
      {/* User route */}
      <Route path="/my-admin-requests" element={<MyAdminRequests />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
