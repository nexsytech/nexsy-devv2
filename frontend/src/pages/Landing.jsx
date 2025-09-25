
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Brain,
  Target,
  Check,
  ArrowRight,
  Users,
  Clock,
  DollarSign,
  Sparkles,
  Play,
  CheckCircle2,
  TrendingUp,
  Shield,
  X,
  Star,
  BarChart3,
  Globe,
  RefreshCw,
  Eye,
  MessageSquare,
  Heart } from
"lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { auth, onAuthStateChange } from "@/lib/firebase";

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        navigate(createPageUrl("Homepage"));
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = () => {
    navigate(createPageUrl("Login"));
  };

  const handleSignup = () => {
    navigate(createPageUrl("Signup"));
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  return (
    <div className="min-h-screen bg-white font-body">
            <style jsx>{`
                .cta-button {
                    background-color: #4f46e5; /* indigo-600 */
                    border-radius: 8px;
                    transition: all 0.2s ease-in-out;
                }
                
                .cta-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04);
                }
                
                .feature-card {
                    border-radius: 12px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                    transition: all 0.2s ease-in-out;
                }
                
                .feature-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                
                .section-fade {
                    animation: fadeInUp 0.8s ease-out;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .footer-link:hover {
                    text-decoration: underline;
                    color: #a5b4fc; /* indigo-300 */
                }
            `}</style>

            {/* Header */}
            <header className="px-4 py-6 flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/01d491c83_Screenshot2025-07-11at113605am.png" alt="Nexsy Logo" className="h-10" />
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleLogin} className="font-button text-slate-600 hover:text-slate-900">
                        Log In
                    </Button>
                    <Button onClick={handleSignup} className="cta-button text-white font-button px-6 py-2 hover:bg-[#3F55FF]">
                        Start Free
                    </Button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-[#F9FAFB] via-white to-[#F9FAFB] overflow-hidden">
                    {/* Background Decorations */}
                    <div className="absolute top-20 right-10 w-80 h-80 gradient-blob"></div>
                    <div className="absolute bottom-20 left-10 w-60 h-60 gradient-blob" style={{ animationDelay: '-4s' }}></div>
                    
                    <div className="max-w-6xl mx-auto text-center relative z-10 section-fade">
                        <Badge className="bg-[#3F55FF]/10 text-[#3F55FF] border border-[#3F55FF]/20 px-6 py-3 rounded-full font-button font-medium mb-8 text-base">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Market Boldly, Stay Invisible
                        </Badge>
                        
                        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
                            Get More Leads 
                            <br />
                            <span className="text-[#3F55FF]">Without Becoming a Content Creator</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-5xl mx-auto leading-relaxed font-body">
                            We started out just like you - building products we loved but struggling to get customers. No budget for agencies, no digital marketing know-how, and definitely no desire to dance on TikTok. Nexsy is the AI marketing team we wish we had. Now it's here to bring leads straight to your doorstep while you focus on running your business.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                            <Button
                onClick={handleSignup}
                size="lg"
                className="cta-button h-16 px-10 text-xl text-white font-button font-medium">

                                <Target className="w-6 h-6 mr-3" />
                                Start Free - Get Your First 10 Leads in 10 Days
                            </Button>
                            <Button
                variant="outline"
                size="lg"
                className="h-16 px-8 text-lg border-2 border-[#3F55FF] text-[#3F55FF] hover:bg-[#3F55FF]/5 font-button font-medium rounded-lg">

                                <Play className="w-5 h-5 mr-3" />
                                See How Nexsy Works
                            </Button>
                        </div>

                        {/* Hero Illustration */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 mx-auto max-w-4xl border border-gray-100 shadow-lg">
                            <div className="flex items-center justify-center space-x-8 md:space-x-12">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Users className="w-10 h-10 text-orange-600" />
                                    </div>
                                    <p className="text-sm text-slate-600 font-body font-medium">Shy Shop Owner<br />Happy with Leads</p>
                                </div>
                                <ArrowRight className="w-8 h-8 text-[#3F55FF]" />
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Brain className="w-10 h-10 text-[#3F55FF]" />
                                    </div>
                                    <p className="text-sm text-slate-600 font-body font-medium">AI Robot<br />Handling Marketing</p>
                                </div>
                                <ArrowRight className="w-8 h-8 text-[#3F55FF]" />
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <BarChart3 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <p className="text-sm text-slate-600 font-body font-medium">Marketing<br />Dashboards</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pain Points Section */}
                <section className="bg-amber-100 px-4 py-20 relative overflow-hidden">
                    <div className="absolute top-10 right-20 w-48 h-48 gradient-blob"></div>
                    <div className="max-w-5xl mx-auto text-center section-fade">
                        <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Why Marketing Feels Impossible for Small Businesses
                        </h2>
                        <p className="text-xl text-slate-600 mb-12 font-body">
                            You're not alone in these struggles - we've been there too.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            <div className="feature-card bg-white p-8 border-l-4 border-[#FF5F5A]">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <X className="w-5 h-5 text-[#FF5F5A]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">No time to market</h3>
                                        <p className="text-slate-600 font-body">You're already the CEO, operator, and customer support.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="feature-card bg-white p-8 border-l-4 border-[#FF5F5A]">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <X className="w-5 h-5 text-[#FF5F5A]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Agencies are expensive</h3>
                                        <p className="text-slate-600 font-body">Thousands spent with no clear results.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="feature-card bg-white p-8 border-l-4 border-[#FF5F5A]">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <X className="w-5 h-5 text-[#FF5F5A]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Posting online feels uncomfortable</h3>
                                        <p className="text-slate-600 font-body">You shouldn't have to become a content creator to sell your products.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="feature-card bg-white p-8 border-l-4 border-[#FF5F5A]">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <X className="w-5 h-5 text-[#FF5F5A]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">DIY tools are confusing</h3>
                                        <p className="text-slate-600 font-body">Multiple apps, wasted ad spend, and no idea what's working.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#3F55FF] to-purple-600 text-white p-8 rounded-2xl shadow-lg">
                            <p className="text-xl md:text-2xl font-heading font-semibold">This was us too. That's why we built Nexsy.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="px-4 py-20 bg-[#F9FAFB] relative overflow-hidden">
                    <div className="absolute bottom-10 left-20 w-64 h-64 gradient-blob"></div>
                    <div className="max-w-6xl mx-auto section-fade">
                        <div className="text-center mb-16">
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                How Nexsy Brings You Leads
                            </h2>
                            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-body">
                                Three simple steps to transform your marketing from overwhelming to effortless
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="feature-card bg-white p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#3F55FF] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-8 h-8 bg-[#3F55FF] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-bold text-lg">1</div>
                                <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">Tell Us About Your Business</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Describe your product, budget, and goals. No marketing expertise required.
                                </p>
                            </div>

                            <div className="feature-card bg-white p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#4CAF50] to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Brain className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-bold text-lg">2</div>
                                <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">AI Builds and Launches Campaigns</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Professional ads, landing pages, and emails in minutes. No personal branding needed.
                                </p>
                            </div>

                            <div className="feature-card bg-white p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#FF9800] to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-8 h-8 bg-[#FF9800] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-bold text-lg">3</div>
                                <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">Leads Delivered to You</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Nexsy runs and optimizes ads 24/7 to bring real potential customers to your doorstep.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Benefits Section */}
                <section className="px-4 py-20 bg-white relative overflow-hidden">
                    <div className="absolute top-20 right-10 w-56 h-56 gradient-blob"></div>
                    <div className="max-w-6xl mx-auto section-fade">
                        <div className="text-center mb-16">
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                Why Small Businesses Choose Nexsy
                            </h2>
                            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-body">
                                Everything you need to market effectively without the complexity
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="feature-card bg-white p-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#7E57C2] to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 mb-3">🚀 No Personal Branding</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Market your products without showing your face or making content.
                                </p>
                            </div>

                            <div className="feature-card bg-white p-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#3F55FF] to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 mb-3">🌐 Multi-Channel Ads</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Get exposure on Google, Meta, and TikTok without juggling platforms.
                                </p>
                            </div>

                            <div className="feature-card bg-white p-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                    <RefreshCw className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 mb-3">🔄 Continuous Optimization</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Nexsy adjusts and improves campaigns automatically to lower costs.
                                </p>
                            </div>

                            <div className="feature-card bg-white p-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF9800] to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 mb-3">📊 Plain-English ROI</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Clear, simple reports show how many leads your campaigns generate.
                                </p>
                            </div>

                            <div className="feature-card bg-white p-8 md:col-span-2 lg:col-span-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#7E57C2] to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-slate-900 mb-3">💰 Affordable</h3>
                                <p className="text-slate-600 leading-relaxed font-body">
                                    Get the power of a marketing team for less than a phone bill.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof Section */}
                <section className="px-4 py-20 bg-[#F9FAFB]">
                    <div className="max-w-4xl mx-auto text-center section-fade">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-12">
                            Loved by Small Business Owners
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="feature-card bg-[#F9FAFB] border border-gray-100 p-8">
                                <div className="flex items-center mb-6">
                                    {[...Array(5)].map((_, i) =>
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  )}
                                </div>
                                <p className="text-slate-700 text-lg mb-6 italic font-body leading-relaxed">
                                    "🛍️ I'm shy about being on camera, so Nexsy was perfect. It built my ads and got me 30 leads in 9 days."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#3F55FF] to-blue-600 rounded-full flex items-center justify-center text-white font-heading font-bold text-xl mr-4 shadow-lg">
                                        S
                                    </div>
                                    <div className="text-left">
                                        <p className="font-heading font-semibold text-slate-900">Sarah</p>
                                        <p className="text-slate-600 font-body">Jewelry Shop Owner</p>
                                    </div>
                                </div>
                            </div>

                            <div className="feature-card bg-[#F9FAFB] border border-gray-100 p-8">
                                <div className="flex items-center mb-6">
                                    {[...Array(5)].map((_, i) =>
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  )}
                                </div>
                                <p className="text-slate-700 text-lg mb-6 italic font-body leading-relaxed">
                                    "🏠 Finally a marketing tool that doesn't expect me to become an influencer!"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#4CAF50] to-green-600 rounded-full flex items-center justify-center text-white font-heading font-bold text-xl mr-4 shadow-lg">
                                        M
                                    </div>
                                    <div className="text-left">
                                        <p className="font-heading font-semibold text-slate-900">Mike</p>
                                        <p className="text-slate-600 font-body">Home Goods Retailer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Founder's Story Section */}
                <section className="px-4 py-20 bg-white relative overflow-hidden">
                    <div className="absolute top-10 right-20 w-72 h-72 gradient-blob"></div>
                    <div className="max-w-4xl mx-auto text-center section-fade">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                            From Struggling Founders to Nexsy
                        </h2>
                        
                        <div className="bg-[#F9FAFB] rounded-3xl p-8 md:p-12 mb-12 border border-gray-100 shadow-lg">
                            <p className="text-xl md:text-2xl leading-relaxed mb-8 text-slate-700 font-body">
                                We built Nexsy because we were in your shoes, juggling every part of our business, watching good products go unnoticed because we couldn't market them. We tried agencies (too expensive), DIY tools (too confusing), and content marketing (too uncomfortable). We almost gave up.
                            </p>
                            <p className="text-xl md:text-2xl leading-relaxed font-body font-medium text-slate-900">
                                That frustration became our fuel. Nexsy is everything we wish we had. An AI partner that takes marketing off your plate and brings leads to your door without needing you to become a marketer or influencer.
                            </p>
                        </div>

                        {/* Founder Illustration */}
                        <div className="bg-white rounded-2xl p-8 mx-auto max-w-2xl shadow-lg border border-gray-100">
                            <div className="flex items-center justify-center space-x-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                        <X className="w-8 h-8 text-[#FF5F5A]" />
                                    </div>
                                    <p className="text-sm font-body font-medium text-slate-600">Frustrated<br />Founders</p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-[#3F55FF]" />
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                        <Heart className="w-8 h-8 text-[#3F55FF]" />
                                    </div>
                                    <p className="text-sm font-body font-medium text-slate-600">Building<br />Nexsy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="px-4 py-24 bg-[#0F172A] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#C6FF4E]/20 rounded-full blur-xl"></div>
                    </div>
                    
                    <div className="max-w-4xl mx-auto relative z-10 section-fade">
                        <h2 className="font-heading text-4xl md:text-6xl font-bold mb-8 leading-tight">
                            Let Nexsy Handle Marketing So You Can Focus on What You Love
                        </h2>
                        <p className="text-xl md:text-2xl mb-12 opacity-90 font-body leading-relaxed">
                            No credit card required. Start now, focus on your craft, and let Nexsy handle the marketing.
                        </p>
                        
                        <Button
              onClick={handleSignup}
              size="lg"
              className="cta-button h-18 px-12 text-2xl text-white font-button font-medium mb-8">

                            <Sparkles className="w-7 h-7 mr-4" />
                            Try Nexsy Free → See Your First Leads in 10 Days
                        </Button>
                        
                        <div className="flex flex-wrap justify-center items-center gap-8 text-lg opacity-80">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <span className="font-body">No Credit Card Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span className="font-body">Setup in 10 Minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-body">Cancel Anytime</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Footer */}
            <footer className="bg-[#0F172A] text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/01d491c83_Screenshot2025-07-11at113605am.png" alt="Nexsy Logo" className="h-10 mb-6 filter brightness-0 invert" />
                            <p className="text-slate-400 font-body leading-relaxed">
                                AI-powered marketing for small businesses who want leads, not likes.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold mb-6">Product</h4>
                            <ul className="space-y-3 text-slate-400 font-body">
                                <li><a href="#" className="footer-link hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">How it Works</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">ROI Calculator</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold mb-6">Company</h4>
                            <ul className="space-y-3 text-slate-400 font-body">
                                <li><a href="#" className="footer-link hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold mb-6">Legal</h4>
                            <ul className="space-y-3 text-slate-400 font-body">
                                <li><a href={createPageUrl("PrivacyPolicy")} className="footer-link hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href={createPageUrl("TermsOfService")} className="footer-link hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">GDPR</a></li>
                                <li><a href="#" className="footer-link hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center">
                        <p className="text-slate-400 font-body">
                            © {new Date().getFullYear()} Cuvio Code Sdn Bhd (Nexsy). Built by founders, for founders. 
                            <span className="text-[#C6FF4E] mx-2">♥</span>
                            No more marketing overwhelm.
                        </p>
                    </div>
                </div>
            </footer>
        </div>);

}
