import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OAuthCallback from "./pages/auth/OAuthCallback";
import Classes from "./pages/Classes";
import Trainers from "./pages/Trainers";
import Memberships from "./pages/Memberships";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTrainers from "./pages/admin/AdminTrainers";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminMemberships from "./pages/admin/AdminMemberships";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminAccounting from "./pages/admin/AdminAccounting";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminPayments from "./pages/admin/AdminPayments";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserLayout from "./components/layout/UserLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes with Sidebar */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="trainers" element={<AdminTrainers />} />
                  <Route path="classes" element={<AdminClasses />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="memberships" element={<AdminMemberships />} />
                  <Route path="plans" element={<AdminPlans />} />
                  <Route path="discounts" element={<AdminDiscounts />} />
                  <Route path="accounting" element={<AdminAccounting />} />
                  <Route path="payments" element={<AdminPayments />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Dashboard />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* Public & User Routes with Main Layout */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/memberships" element={<Memberships />} />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
