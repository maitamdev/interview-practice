import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcuts";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewReport from "./pages/InterviewReport";
import QuickPractice from "./pages/QuickPractice";
import QuestionBank from "./pages/QuestionBank";
import Leaderboard from "./pages/Leaderboard";
import LearningPath from "./pages/LearningPath";
import LearnCourse from "./pages/LearnCourse";
import DailyChallenge from "./pages/DailyChallenge";
import Statistics from "./pages/Statistics";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <AuthProvider>
          <I18nProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <KeyboardShortcutsModal />
              <BrowserRouter>
                <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
              <Route path="/interview/new" element={
                <ProtectedRoute><InterviewSetup /></ProtectedRoute>
              } />
              <Route path="/interview/:id" element={
                <ProtectedRoute><InterviewRoom /></ProtectedRoute>
              } />
              <Route path="/interview/:id/report" element={
                <ProtectedRoute><InterviewReport /></ProtectedRoute>
              } />
              <Route path="/quick-practice" element={
                <ProtectedRoute><QuickPractice /></ProtectedRoute>
              } />
              <Route path="/question-bank" element={
                <ProtectedRoute><QuestionBank /></ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute><Leaderboard /></ProtectedRoute>
              } />
              <Route path="/learning-path" element={
                <ProtectedRoute><LearningPath /></ProtectedRoute>
              } />
              <Route path="/learn/:courseId" element={
                <ProtectedRoute><LearnCourse /></ProtectedRoute>
              } />
              <Route path="/daily-challenge" element={
                <ProtectedRoute><DailyChallenge /></ProtectedRoute>
              } />
              <Route path="/statistics" element={
                <ProtectedRoute><Statistics /></ProtectedRoute>
              } />
              <Route path="/bookmarks" element={
                <ProtectedRoute><Bookmarks /></ProtectedRoute>
              } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </I18nProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
