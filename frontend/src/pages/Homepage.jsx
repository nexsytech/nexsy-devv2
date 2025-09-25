
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SimplifiedProduct } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { 
  Package, 
  ArrowRight, 
  Bot, 
  Target, 
  Wand2, 
  Rocket as RocketIcon, 
  Users, 
  BrainCircuit 
} from "lucide-react";

const currencySymbolMap = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', CHF: 'Fr', CNY: '¥',
  SEK: 'kr', NZD: '$', INR: '₹', BRL: 'R$', RUB: '₽', KRW: '₩', SGD: '$', NOK: 'kr',
  MXN: '$', HKD: '$', TRY: '₺', ZAR: 'R', PLN: 'zł', THB: '฿', ILS: '₪', DKK: 'kr',
  AED: 'د.إ',
};

const formatPrice = (price, currency) => {
    const symbol = currencySymbolMap[currency] || currency || '$';
    // Ensure price is treated as a number for toFixed, if not, use it as is (e.g., 'Contact Us')
    const formattedPrice = typeof price === 'number' ? price.toFixed(2).replace(/\.00$/, '') : price;
    return `${symbol}${formattedPrice}`;
};

export default function Homepage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // New state for error handling

  useEffect(() => {
    loadHomepageData();
  }, []);

  const loadHomepageData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      try {
        const userProducts = await SimplifiedProduct.filter({ created_by: currentUser.email }, '-created_date');
        setProducts(userProducts || []);
      } catch (productError) {
        console.error("Error loading products:", productError);
        // Continue with empty products array if database is having issues
        setProducts([]);
        setError("Unable to load your products right now. Please try refreshing the page.");
      }
    } catch (err) { // Changed 'error' to 'err' to avoid name collision with state variable
      console.error("Error loading homepage data:", err);
      setError("Unable to load data. Please try refreshing the page.");
      // Don't redirect immediately - give user a chance to retry
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null); // Clear previous error
    loadHomepageData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (user?.full_name) return user.full_name.split(' ')[0];
    return user?.email?.split('@')[0] || 'there';
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} text="Loading your dashboard..." />;
  }

  // Error state with retry option
  // This is a critical error (e.g., user data failed to load)
  if (error && !user) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fadeIn">
        <div className="max-w-4xl mx-auto">
          <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Connection Issue</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={handleRetry} className="btn-primary">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fadeIn">
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gradient-blob {
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%);
          position: absolute;
          z-index: 0;
          pointer-events: none;
        }
      `}</style>
      <div className="relative w-full max-w-none space-y-12">
        <div className="gradient-blob w-96 h-96 -top-20 -left-20"></div>
        <div className="gradient-blob w-96 h-96 -bottom-20 -right-20"></div>
        
        {/* Error banner if products failed to load but user is authenticated */}
        {error && user && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <p className="text-yellow-800 text-sm">{error}</p>
              </div>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Header */}
        <header className="space-y-2 relative">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
            {getGreeting()}, {getFirstName()}!
          </h1>
          <p className="text-lg text-slate-600 font-body">Ready to get more customers? Let's get started.</p>
        </header>

        {/* Conditional Content */}
        {!hasProducts ? (
          <EmptyState />
        ) : (
          <DashboardWithProducts products={products} />
        )}
      </div>
    </div>
  );
}

const EmptyState = () => (
  <div className="text-center bg-white rounded-xl shadow-lg p-8 md:p-16 border border-slate-100 relative">
    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
      <RocketIcon className="w-10 h-10 text-indigo-600" />
    </div>
    <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-800 mb-4">Let’s add your first product!</h2>
    <p className="text-slate-600 mb-8 max-w-md mx-auto font-body">
      You're just one step away from letting our AI create amazing ads for you.
    </p>
    <Link to={createPageUrl("ProductCreativeSetup")}>
      <Button size="lg" className="h-14 px-8 text-lg rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
        <Wand2 className="w-5 h-5 mr-3" />
        Add Your First Product
      </Button>
    </Link>
  </div>
);

const DashboardWithProducts = ({ products }) => (
  <div className="space-y-12">
    <QuickStartWidget />
    <YourProductsSection products={products} />
  </div>
);

const QuickStartWidget = () => (
  <Card className="shadow-lg rounded-xl border-0 bg-white">
    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex-1 space-y-4">
        <h3 className="font-heading text-2xl font-bold text-slate-800">Your Quick Start Guide</h3>
        <div className="space-y-4 font-body">
          <StepItem 
            step="1" 
            title="Add Your Product" 
            description="Tell us what you're selling. It only takes a few minutes."
            linkTo={createPageUrl("ProductCreativeSetup")}
            color="from-indigo-400 to-indigo-600"
            icon={Users}
          />
          <StepItem 
            step="2" 
            title="AI Creates Your Ads" 
            description="Our AI generates compelling ad copy and visuals for you."
            color="from-purple-400 to-purple-600"
            icon={BrainCircuit}
          />
          <StepItem 
            step="3" 
            title="Launch Your Ads" 
            description="Promote your product on platforms like TikTok and Facebook."
            linkTo={createPageUrl("CampaignLauncher")}
            color="from-pink-400 to-pink-600"
            icon={Target}
          />
        </div>
      </div>
      <div className="hidden md:block bg-indigo-50 rounded-xl p-8 text-center">
        <Bot className="w-24 h-24 text-indigo-400 mx-auto" />
        <p className="font-semibold text-indigo-800 mt-4 font-body">Your AI Marketing Assistant</p>
      </div>
    </CardContent>
  </Card>
);

const StepItem = ({ step, title, description, linkTo, color, icon: Icon }) => {
  const content = (
    <div className="flex items-center gap-4 group">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} text-white flex-shrink-0 flex items-center justify-center font-bold font-heading text-lg transition-transform group-hover:scale-110`}>
        {step}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-slate-600 text-sm">{description}</p>
      </div>
      {linkTo && <ArrowRight className="w-5 h-5 text-slate-400 ml-auto transition-transform group-hover:translate-x-1" />}
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} className="block p-3 rounded-lg hover:bg-slate-50 transition-colors">{content}</Link>
  ) : (
    <div className="p-3">{content}</div>
  );
};


const YourProductsSection = ({ products }) => {
  const navigate = useNavigate();
  return (
    <Card className="shadow-lg rounded-xl border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-2xl font-bold text-slate-800">Your Products</CardTitle>
        <Link to={createPageUrl("YourProducts")}>
          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold rounded-lg">
            See Full List <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product) => (
            <Card 
              key={product.id} 
              className="rounded-xl border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              onClick={() => navigate(createPageUrl(`ProductDetails?id=${product.id}`))}
            >
              <CardContent className="p-4 flex flex-col h-full">
                {product.product_image_url ? (
                  <img src={product.product_image_url} alt={product.product_name} className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <h4 className="font-semibold font-heading text-slate-900 truncate mb-1">
                  {product.product_name}
                </h4>
                <p className="text-sm text-slate-600 font-body line-clamp-2 flex-grow">
                  {product.what_is_it}
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs font-body">
                    {formatPrice(product.price, product.currency)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
