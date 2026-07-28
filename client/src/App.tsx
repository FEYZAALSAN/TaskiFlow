import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// --- Sayfa Importları ---
import Index from "./pages/Index";
import Features from "./pages/Features";
import Solutions from "./pages/Solutions";
import Plans from "./pages/Plans";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import OrganizationDetail from "./pages/OrganizationDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import ReportsList from "./pages/Reportslist";   // ← YENİ
import Proje from './pages/Proje';
import Members from "./pages/Members";
import Projelerim from "./pages/Projelerim";

import Footer from "./components/Footer";
import Layout from "./components/Layout";

// AI sayfası geçici kapalı — açmak için yorumu kaldır
// import AIPage from "./pages/AI";
import Pulse from "./pages/Pulse"

import Connected from "./pages/ConnectedAccounts";
import Export from "./pages/ExportProjects"
import ProfilePage from "./pages/Profilepage";
import SecurityPage from "./pages/Securitypage";
import BillingPage from "./pages/Billingpage";
import TemplatesPage from "./pages/Templatespage.tsx"
import DocumentsPage from "./pages/Documentspage";



function WithFooter({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow">{children}</div>
            <Footer />
        </div>
    );
}

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <BrowserRouter>
                <Routes>





                    {/* Landing Sayfaları */}
                    <Route path="/" element={<WithFooter><Index /></WithFooter>} />
                    <Route path="/features" element={<WithFooter><Features /></WithFooter>} />
                    <Route path="/solutions" element={<WithFooter><Solutions /></WithFooter>} />
                    <Route path="/plans" element={<WithFooter><Plans /></WithFooter>} />
                    <Route path="/resources" element={<WithFooter><Resources /></WithFooter>} />
                    <Route path="/contact" element={<WithFooter><Contact /></WithFooter>} />
                    <Route path="/terms" element={<WithFooter><Terms /></WithFooter>} />
                    <Route path="/privacy" element={<WithFooter><Privacy /></WithFooter>} />
                    <Route path="/payment" element={<WithFooter><Payment /></WithFooter>} />
                    <Route path="/payment-success" element={<WithFooter><PaymentSuccess /></WithFooter>} />

                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<Verify />} />

                    {/* Panel — Sidebar VAR */}
                    <Route element={<Layout />}>
                        {/* <Route path="/ai" element={<AIPage />} /> */}
                        <Route path="/pulse" element={<Pulse />} />
                        <Route path="/inbox" element={<Notifications />} />
                        <Route path="/members" element={<Members />} />
                        <Route path="/projects" element={<Projelerim />} />
                        <Route path="/projects/:projectId" element={<Proje />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/teams/:orgId" element={<OrganizationDetail />} />
                        <Route path="/organization/:orgId" element={<OrganizationDetail />} />
                        <Route path="/reports" element={<ReportsList />} />              {/* ← Kart listesi */}
                        <Route path="/reports/:projectId" element={<Reports />} />       {/* ← Detay sayfası */}
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/test-projelerim" element={<Projelerim />} />
                        <Route path="/settings/connections" element={<Connected userId={""} />} />
                        <Route path="/settings/import" element={<Export />} />
                        <Route path="/settings/profile" element={<ProfilePage />} />
                        <Route path="/settings/security" element={<SecurityPage />} />
                        <Route path="/settings/billing" element={<BillingPage />} />
                        <Route path="/settings/templates" element={<TemplatesPage />} />
                        <Route path="/settings/documents" element={<DocumentsPage />} />
                        
                        


                    </Route>

                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;

