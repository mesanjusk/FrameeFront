import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts and wrappers
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

// Pages/components
import Login from './components/Login';          // Single Login import
import Register from './pages/Register';         // Or './components/Register' if you have both, adjust accordingly
import Signup from './components/Signup';
import ImageUploader from './components/ImageUploader';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Planner App pages
import Planner from './pages/Planner';
import Review from './pages/Review';
import Team from './pages/Team';

// Core dashboard pages
import Dashboard from './pages/Dashboard';
import User from './pages/User';
import Enquiry from './pages/Enquiry';
import Courses from './pages/Courses';
import Batches from './pages/Batches';
import OrgCategories from './pages/OrgCategories';
import Education from './pages/Education';
import Exam from './pages/Exam';
import PaymentMode from './pages/remove1';
import InstituteProfile from './pages/instituteProfile';
import Owner from './pages/Owner';
import CoursesCategory from './pages/CoursesCategory';
import Leads from './Reports/Leads';
import AllAdmission from './Reports/allAdmission';
import AddLead from './pages/AddLead';
import AddNew from './components/admissions/AddAdmission';
import Followup from './pages/remove';
import WhatsAppAdminPage from './pages/WhatsAppAdminPage';
import AddReciept from './pages/addReciept';
import AddPayment from './pages/addPayment';
import AllLeadByAdmission from './Reports/allLeadByAdmission';
import AddAttendance from './pages/AddAttendance';
import AllAttendance from './Reports/allAttendance';
import AllBatches from './Reports/allBatches';
import AllBalance from './Reports/allBalance';
import AddAccount from './pages/AddAccount';
import AllExams from './Reports/allExams';
import Institutes from './pages/Institutes';
import Instify from './pages/Instify';

export default function App() {
  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/upload" element={<ImageUploader />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:id" element={<ResetPassword />} />

      {/* ➕ Standalone Extra Public Pages (from old app) */}
      <Route path="/planner" element={<Planner />} />
      <Route path="/review" element={<Review />} />
      <Route path="/team" element={<Team />} />

      {/* 🔐 Protected Routes */}
      <Route
        path="/:username"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="user" element={<User />} />
        <Route path="batches" element={<Batches />} />
        <Route path="enquiry" element={<Enquiry />} />
        <Route path="courses" element={<Courses />} />
        <Route path="orgcategories" element={<OrgCategories />} />
        <Route path="education" element={<Education />} />
        <Route path="exam" element={<Exam />} />
        <Route path="paymentmode" element={<PaymentMode />} />
        <Route path="instituteProfile" element={<InstituteProfile />} />
        <Route path="owner" element={<Owner />} />
        <Route path="institutes" element={<Institutes />} />
        <Route path="coursesCategory" element={<CoursesCategory />} />
        <Route path="leads" element={<Leads />} />
        <Route path="allAdmission" element={<AllAdmission />} />
        <Route path="allLeadByAdmission" element={<AllLeadByAdmission />} />
        <Route path="add-lead" element={<AddLead />} />
        <Route path="addNewAdd" element={<AddNew />} />
        <Route path="addReciept" element={<AddReciept />} />
        <Route path="addPayment" element={<AddPayment />} />
        <Route path="addAccount" element={<AddAccount />} />
        <Route path="followup" element={<Followup />} />
        <Route path="addAttendance" element={<AddAttendance />} />
        <Route path="allAttendance" element={<AllAttendance />} />
        <Route path="allBalance" element={<AllBalance />} />
        <Route path="allBatches" element={<AllBatches />} />
        <Route path="whatsapp" element={<WhatsAppAdminPage />} />
        <Route path="instify" element={<Instify />} />
        <Route path="allExams" element={<AllExams />} />
      </Route>

      {/* 🧭 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
