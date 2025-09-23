import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ApplicantDashboard } from "./pages/ApplicantDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Unauthorized } from "./pages/Unauthorized";
import { Contact } from "./pages/Contact";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { FeaturesPage } from "./pages/FeaturesPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { PartnersPage } from "./pages/PartnersPage";
import ProjectSubmission from "./pages/ProjectSubmission";
import ApplicantProjects from "./pages/ApplicantProjects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectEdit from "./pages/ProjectEdit";
import ApplicantReports from "./pages/ApplicantReports";
import { ApplicantProfile } from "./pages/ApplicantProfile";
import { ApplicantSettings } from "./pages/ApplicantSettings";
import { ApplicantHelp } from "./pages/ApplicantHelp";
import { ApplicantNotifications } from "./pages/ApplicantNotifications";
import AdminFirePrediction from "./pages/AdminFirePrediction";
import TestAutoReview from "./pages/TestAutoReview";
import AdvancedTestAutoReview from "./pages/AdvancedTestAutoReview";
import BackgroundAnalysisDashboard from "./pages/BackgroundAnalysisDashboard";
import MonitoringPage from "./pages/MonitoringPage";
import SensorSimulation from "./pages/SensorSimulation";
import "./testAutoReview"; // تحميل ملف الاختبار

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ScrollToTopButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ApplicantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/fire-prediction" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminFirePrediction />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route 
              path="/applicant/submit-project" 
              element={
                <ProtectedRoute>
                  <ProjectSubmission />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/projects" 
              element={
                <ProtectedRoute>
                  <ApplicantProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/project/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/project/:projectId/edit" 
              element={
                <ProtectedRoute>
                  <ProjectEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/reports" 
              element={
                <ProtectedRoute>
                  <ApplicantReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/profile" 
              element={
                <ProtectedRoute>
                  <ApplicantProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/settings" 
              element={
                <ProtectedRoute>
                  <ApplicantSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/help" 
              element={
                <ProtectedRoute>
                  <ApplicantHelp />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/notifications" 
              element={
                <ProtectedRoute>
                  <ApplicantNotifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-auto-review" 
              element={<TestAutoReview />} 
            />
            <Route 
              path="/advanced-test-auto-review" 
              element={<AdvancedTestAutoReview />} 
            />
            <Route 
              path="/admin/background-analysis" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <BackgroundAnalysisDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/monitoring" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <MonitoringPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sensor-simulation" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <SensorSimulation />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
