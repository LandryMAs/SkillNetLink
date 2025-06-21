import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Network from "@/pages/Network";
import Jobs from "@/pages/Jobs";
import Projects from "@/pages/Projects";
import Services from "@/pages/Services";
import Messages from "@/pages/Messages";
import Admin from "@/pages/Admin";
import Layout from "@/components/Layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-chad-blue"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <Layout>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/network" component={Network} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/projects" component={Projects} />
          <Route path="/services" component={Services} />
          <Route path="/messages" component={Messages} />
          <Route path="/admin" component={Admin} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
