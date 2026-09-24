import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ChatPage } from "./pages/ChatPage";
import { ConversationsPage } from "./pages/ConversationsPage";
import { TicketsPage } from "./pages/TicketsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SupportDashboardPage } from "./pages/SupportDashboardPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { SupportTicketDetailPage } from "./pages/SupportTicketDetailPage";
import { SupportCustomersPage } from "./pages/SupportCustomersPage";
import { HomeRedirect, NotFoundRedirect } from "./pages/HomeRedirect";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["SUPPORT_AGENT"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/support/dashboard" element={<SupportDashboardPage />} />
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
          <Route path="/support/tickets/:id" element={<SupportTicketDetailPage />} />
          <Route path="/support/customers" element={<SupportCustomersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}

export default App;
