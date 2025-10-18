import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Admin pages
import AdminLogin from "./pages/admin/admin-login";
import AdminDashboard from "./pages/admin/admin-dashboard";
import AdminMentorship from "./pages/admin/admin-mentorship";
import AddMentor from "./pages/admin/mentors/add";
import AddProgram from "./pages/admin/programs/add";
import AddResource from "./pages/admin/resources/add";
import AddResourceNew from "./pages/admin/resources/add-new";
import EditResource from "./pages/admin/resources/edit";
import ViewResource from "./pages/admin/resources/view";
import MentorsList from "./pages/admin/mentors/list";
import ProgramsList from "./pages/admin/programs/list";
import ResourcesList from "./pages/admin/resources/list";
import AdminVendors from "@/pages/admin/vendors";
import AdminSettings from "@/pages/admin/settings";
import AdminDiscussions from "./pages/admin/community/discussions";
import AdminProductReports from "./pages/admin/product-reports";
import AdminProfile from "./pages/admin/admin-profile";
import AdminQuickSales from "./pages/admin/admin-quick-sales";
import NotFound from "@/pages/not-found";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/profile" component={AdminProfile} />
      <Route path="/admin/mentorship" component={AdminMentorship} />
      <Route path="/admin/mentors/add" component={AddMentor} />
      <Route path="/admin/mentors" component={MentorsList} />
      <Route path="/admin/programs/add" component={AddProgram} />
      <Route path="/admin/programs" component={ProgramsList} />
      <Route path="/admin/resources/add" component={AddResourceNew} />
      <Route path="/admin/resources/edit/:id" component={EditResource} />
      <Route path="/admin/resources/:id" component={ViewResource} />
      <Route path="/admin/resources" component={ResourcesList} />
      <Route path="/admin/vendors" component={AdminVendors} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/community/discussions" component={AdminDiscussions} />
      <Route path="/admin/product-reports" component={AdminProductReports} />
      <Route path="/admin/quick-sales" component={AdminQuickSales} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <AdminRouter />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}