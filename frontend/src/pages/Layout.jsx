

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  Rocket,
  Eye,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, onAuthStateChange, logOut } from "@/lib/firebase";

const navigationItems = [
  // Homepage item removed as per new design
  {
    title: "Products",
    url: createPageUrl("YourProducts"),
    icon: Package,
  },
  {
    title: "Promote My Product", // Changed title
    url: createPageUrl("CampaignLauncher"),
    icon: Rocket, // Changed icon
  },
  {
    title: "See My Ad Preview", // Changed title
    url: createPageUrl("AdVerification"),
    icon: Eye, // Changed icon
  },
  {
    title: "Learning",
    url: createPageUrl("Learning"),
    icon: BookOpen,
  }
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Add Meta domain verification tag
    const meta = document.createElement('meta');
    meta.name = 'facebook-domain-verification';
    meta.content = '9hu74s9a9nrtdcry8v4wif42euzady';
    document.head.appendChild(meta);

    // Add Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Initialize Facebook SDK
    const initFacebookSDK = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '2082106785651828', // Replace with your actual Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v23.0'
        });
        
        window.FB.AppEvents.logPageView();
      };

      // Load Facebook SDK
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    initFacebookSDK();

    return () => {
      if (meta.parentNode === document.head) {
        document.head.removeChild(meta);
      }
      if (fontLink.parentNode === document.head) {
        document.head.removeChild(fontLink);
      }
      // No cleanup needed for Facebook SDK as it's typically a global integration
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our expected user format
        setUser({
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
        // Allow public access to Landing, legal, and password reset pages
        const publicPages = ['Landing', 'Login', 'Signup', 'ForgotPassword', 'PrivacyPolicy', 'TermsOfService'];
        if(!publicPages.includes(currentPageName)) {
            navigate(createPageUrl('Landing'))
        }
      }
    });

    return () => unsubscribe();
  }, [currentPageName, navigate]);

  const handleLogout = async () => {
    await logOut();
    navigate(createPageUrl("Landing"));
  };

  const isActive = (url) => {
    const cleanUrl = url.split('?')[0]; // Remove query params from the target URL
    const currentPath = location.pathname;

    // Exact match is always preferred for the base page itself
    if (currentPath === cleanUrl) {
      return true;
    }

    // For section-based active states (e.g., /products/123 should highlight /products)
    // Only apply this if the cleanUrl is not just the root '/'
    if (cleanUrl !== '/' && currentPath.startsWith(cleanUrl)) {
      // Ensure it's a true sub-path and not just a prefix match (e.g., /products vs /products-category)
      // The character immediately after the matched prefix should be '/' or the end of the path
      return currentPath.length === cleanUrl.length || currentPath[cleanUrl.length] === '/';
    }

    return false;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/01d491c83_Screenshot2025-07-11at113605am.png" alt="Nexsy Logo" className="h-8" />
        </Link>
        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            onClick={() => sidebarOpen && setSidebarOpen(false)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(item.url)
                ? "bg-indigo-600 text-white" // Changed from bg-blue-600
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-auto p-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0"> {/* Changed from bg-blue-100 text-blue-600 */}
                            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold truncate text-slate-800">{user?.full_name}</p>
                            <p className="text-xs truncate text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuItem onSelect={() => navigate(createPageUrl('Settings'))}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
  
  const publicPages = ['Landing', 'Login', 'Signup', 'ForgotPassword', 'PrivacyPolicy', 'TermsOfService'];
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }
  
  if (!user) {
    return null; // Or a loading spinner while user is being checked
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-slate-200">
          <SidebarContent />
        </div>
      </div>

      {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
              <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
                  <SidebarContent />
              </div>
          </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <div className="lg:hidden p-2 bg-white border-b border-slate-200 flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/01d491c83_Screenshot2025-07-11at113605am.png" alt="Nexsy Logo" className="h-7" />
            </Link>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

