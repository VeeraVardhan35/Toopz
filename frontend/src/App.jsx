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

function AppRoutes() {
  const { isAuth, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-black text-xl font-semibold">Loading...</div>
      </div>
    );
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