import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Project from '@/pages/Project';
import GigDetails from '@/pages/GigDetails';
import Pricing from '@/pages/Pricing';
import NotFound from '@/pages/NotFound';
import ServerError from '@/pages/ServerError';
import Forbidden from '@/pages/Forbidden';
import Maintenance from '@/pages/Maintenance';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SubmitProposal from '@/pages/SubmitProposal';
import MyProposals from '@/pages/MyProposals';
import SavedJobs from '@/pages/SavedJobs';
import Profile from '@/pages/Profile';
import GitHubCallback from '@/pages/GitHubCallback';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import AllIssues from '@/pages/AllIssues';
import SellerDashboard from '@/pages/SellerDashboard';
import Marketplace from '@/pages/Marketplace';
import Leaderboard from '@/pages/Leaderboard';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/gig/:id" element={<GigDetails />} />
            <Route path="/projects/:id/propose" element={<SubmitProposal />} />
            <Route path="/submit-proposal/:id" element={<SubmitProposal />} />
            <Route path="/proposals" element={<MyProposals />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/issues" element={<AllIssues />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/github-callback" element={<GitHubCallback />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
