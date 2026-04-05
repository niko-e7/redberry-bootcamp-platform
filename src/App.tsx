import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";

function ModalController() {
  const { modalState } = useAuth();
  if (modalState === "login") return <LoginModal />;
  if (modalState === "register") return <RegisterModal />;
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalController />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;