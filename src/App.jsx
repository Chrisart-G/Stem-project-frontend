// src/App.jsx
import { useState } from "react";
import Home from "./Component/Home";
import StudentLogin from "./Component/StudentLogin";
import StudentDashboard from "./Component/StudentDashboard";
import AdminLogin from "./Component/AdminLogin";
import AdminDashboard from "./Component/AdminDashboard";
import "./App.css";

function App() {
  const [view, setView] = useState("home");
  const [student, setStudent] = useState(null);
  const [admin, setAdmin] = useState(null);

  const handleStudentLoginSuccess = (studentData) => {
    setStudent(studentData);
    setView("student-dashboard");
  };

  const handleAdminLoginSuccess = (adminData) => {
    setAdmin(adminData);
    setView("admin-dashboard");
  };

  const handleStudentLogout = () => {
    setStudent(null);
    setView("home");
  };

  const handleAdminLogout = () => {
    setAdmin(null);
    setView("home");
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f5f5]">
      {view === "home" && (
        <Home
          onStudentLogin={() => setView("student-login")}
          onAdminLogin={() => setView("admin-login")}
        />
      )}

      {view === "student-login" && (
        <StudentLogin
          onBack={() => setView("home")}
          onLoginSuccess={handleStudentLoginSuccess}
        />
      )}

      {view === "student-dashboard" && student && (
        <StudentDashboard student={student} onLogout={handleStudentLogout} />
      )}

      {view === "admin-login" && (
        <AdminLogin
          onBack={() => setView("home")}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {view === "admin-dashboard" && admin && (
        <AdminDashboard admin={admin} onLogout={handleAdminLogout} />
      )}
    </div>
  );
}

export default App;