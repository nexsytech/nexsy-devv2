
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { BusinessProfile } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Building, Target, DollarSign, Users, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Business Basics", icon: Building },
  { id: 2, title: "Business Scale", icon: DollarSign },
  { id: 3, title: "Marketing Experience", icon: Target },
  { id: 4, title: "Complete Setup", icon: CheckCircle }
];

export default function BusinessSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    business_name: "",
    business_type: "",
    industry: "",
    company_size: "",
    annual_revenue: "",
    monthly_marketing_budget: "",
    current_advertising_platforms: [],
    marketing_pain_points: [],
    target_audience: "",
    business_goals: [],
    website_url: "",
    phone: "",
    address: "",
    brand_slogan: "", // New field
    brand_tone: "professional", // New field with default
    brand_primary_color: "#3F55FF", // New field with default
    brand_secondary_color: "#C6FF4E", // New field with default
    brand_accent_color: "#FF5F5A", // New field with default
    setup_completed: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Check if profile already exists
      const profiles = await BusinessProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        const existingProfile = profiles[0];
        if (existingProfile.setup_completed) {
          navigate(createPageUrl("Homepage"));
          return;
        }
        // Merge existing profile data with default values for new fields
        setProfile(prev => ({
          ...prev,
          ...existingProfile,
          brand_tone: existingProfile.brand_tone || "professional",
          brand_primary_color: existingProfile.brand_primary_color || "#3F55FF",
          brand_secondary_color: existingProfile.brand_secondary_color || "#C6FF4E",
          brand_accent_color: existingProfile.brand_accent_color || "#FF5F5A",
        }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data. Please try again.");
      navigate(createPageUrl("Landing"));
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        ...profile,
        // Ensure that new optional fields are saved even if empty or default
        brand_slogan: profile.brand_slogan || "",
        brand_tone: profile.brand_tone || "professional",
        brand_primary_color: profile.brand_primary_color || "#3F55FF",
        brand_secondary_color: profile.brand_secondary_color || "#C6FF4E",
        brand_accent_color: profile.brand_accent_color || "#FF5F5A",
        setup_completed: true
      };

      if (profile.id) {
        await BusinessProfile.update(profile.id, profileData);
      } else {
        await BusinessProfile.create(profileData);
      }

      toast.success("Business profile completed!");
      navigate(createPageUrl("Homepage"));
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    }
    setSaving(false);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.business_name && profile.business_type && profile.industry;
      case 2:
        return profile.company_size && profile.annual_revenue && profile.monthly_marketing_budget;
      case 3:
        return profile.current_advertising_platforms.length > 0 && profile.marketing_pain_points.length > 0;
      case 4:
        // Brand management fields are optional, so they don't affect validation for this step.
        // Existing validation for target_audience and business_goals remains.
        return profile.target_audience && profile.business_goals.length > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="w-full max-w-none mx-auto">
        <div className="mb-8">
          <div className="text-center mb-8">
            <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Business Profile Setup
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Tell Us About Your Business
            </h1>
            <p className="text-slate-600">
              This helps us create personalized marketing strategies for your specific needs
            </p>
          </div>

          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="flex items-center gap-2 md:gap-4 min-w-max px-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className={`text-xs md:text-sm font-medium hidden sm:block ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-6 md:w-8 h-0.5 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-slate-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Progress value={progress} className="mb-8" />
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      value={profile.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Enter your business name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_type">Business Type *</Label>
                    <Select
                      value={profile.business_type}
                      onValueChange={(value) => handleInputChange('business_type', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="e-commerce">E-commerce</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry/Niche *</Label>
                  <Input
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Real Estate, Beauty, Fitness, SaaS, etc."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={profile.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_size">Company Size *</Label>
                    <Select
                      value={profile.company_size}
                      onValueChange={(value) => handleInputChange('company_size', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Just me</SelectItem>
                        <SelectItem value="2_5">2-5 employees</SelectItem>
                        <SelectItem value="6_20">6-20 employees</SelectItem>
                        <SelectItem value="21_50">21-50 employees</SelectItem>
                        <SelectItem value="51_200">51-200 employees</SelectItem>
                        <SelectItem value="201_1000">201-1,000 employees</SelectItem>
                        <SelectItem value="1000_plus">1,000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="annual_revenue">Annual Revenue *</Label>
                    <Select
                      value={profile.annual_revenue}
                      onValueChange={(value) => handleInputChange('annual_revenue', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_50k">Under $50k</SelectItem>
                        <SelectItem value="50k_100k">$50k - $100k</SelectItem>
                        <SelectItem value="100k_500k">$100k - $500k</SelectItem>
                        <SelectItem value="500k_1m">$500k - $1M</SelectItem>
                        <SelectItem value="1m_5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m_10m">$5M - $10M</SelectItem>
                        <SelectItem value="10m_plus">$10M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthly_marketing_budget">Monthly Marketing Budget *</Label>
                  <Select
                    value={profile.monthly_marketing_budget}
                    onValueChange={(value) => handleInputChange('monthly_marketing_budget', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_500">Under $500</SelectItem>
                      <SelectItem value="500_1k">$500 - $1,000</SelectItem>
                      <SelectItem value="1k_2500">$1,000 - $2,500</SelectItem>
                      <SelectItem value="2500_5k">$2,500 - $5,000</SelectItem>
                      <SelectItem value="5k_10k">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k_plus">$25,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Which platforms do you currently use for advertising? (Select all that apply) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {[
                      { id: 'facebook', name: 'Facebook' },
                      { id: 'instagram', name: 'Instagram' },
                      { id: 'google_ads', name: 'Google Ads' },
                      { id: 'youtube', name: 'YouTube' },
                      { id: 'tiktok', name: 'TikTok' },
                      { id: 'linkedin', name: 'LinkedIn' },
                      { id: 'twitter', name: 'Twitter/X' },
                      { id: 'pinterest', name: 'Pinterest' },
                      { id: 'snapchat', name: 'Snapchat' },
                      { id: 'email', name: 'Email Marketing' },
                      { id: 'seo', name: 'SEO' },
                      { id: 'print', name: 'Print Advertising' },
                      { id: 'radio', name: 'Radio' },
                      { id: 'tv', name: 'TV' },
                      { id: 'none', name: 'None - Just Starting' }
                    ].map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={profile.current_advertising_platforms.includes(platform.id)}
                          onCheckedChange={() => handleArrayToggle('current_advertising_platforms', platform.id)}
                        />
                        <Label htmlFor={platform.id} className="text-sm">{platform.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">What are your biggest challenges in marketing and reaching customers? (Select all that apply) *</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    {[
                      'Finding the right target audience',
                      'Creating compelling ad content',
                      'Managing advertising budgets effectively',
                      'Measuring return on investment (ROI)',
                      'Competing with larger businesses',
                      'Keeping up with platform changes',
                      'Generating consistent leads',
                      'Converting leads to customers',
                      'Building brand awareness',
                      'Understanding which platforms work best',
                      'Creating enough content regularly',
                      'Analyzing performance data'
                    ].map((painPoint) => (
                      <div key={painPoint} className="flex items-center space-x-2">
                        <Checkbox
                          id={painPoint}
                          checked={profile.marketing_pain_points.includes(painPoint)}
                          onCheckedChange={() => handleArrayToggle('marketing_pain_points', painPoint)}
                        />
                        <Label htmlFor={painPoint} className="text-sm">{painPoint}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="target_audience">Describe your ideal customer in 1-2 sentences *</Label>
                  <Textarea
                    id="target_audience"
                    value={profile.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    placeholder="e.g., Small business owners aged 30-50 who struggle with digital marketing and want to grow their online presence..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">What are your primary business goals? (Select all that apply) *</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    {[
                      { id: 'increase_sales', name: 'Increase Sales Revenue' },
                      { id: 'generate_leads', name: 'Generate More Leads' },
                      { id: 'build_brand_awareness', name: 'Build Brand Awareness' },
                      { id: 'expand_market', name: 'Expand to New Markets' },
                      { id: 'launch_new_product', name: 'Launch New Product/Service' },
                      { id: 'improve_customer_retention', name: 'Improve Customer Retention' },
                      { id: 'reduce_acquisition_cost', name: 'Reduce Customer Acquisition Cost' },
                      { id: 'increase_website_traffic', name: 'Increase Website Traffic' }
                    ].map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal.id}
                          checked={profile.business_goals.includes(goal.id)}
                          onCheckedChange={() => handleArrayToggle('business_goals', goal.id)}
                        />
                        <Label htmlFor={goal.id} className="text-sm">{goal.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Optional: Brand Information</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Add your brand details now or complete them later in your Business Profile.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="brand_slogan">Brand Slogan/Tagline</Label>
                      <Input
                        id="brand_slogan"
                        value={profile.brand_slogan || ""}
                        onChange={(e) => handleInputChange('brand_slogan', e.target.value)}
                        placeholder="e.g., Just Do It, Think Different"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand_tone">Brand Tone</Label>
                      <Select
                        value={profile.brand_tone || "professional"}
                        onValueChange={(value) => handleInputChange('brand_tone', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select brand tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="fun">Fun</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="authentic">Authentic</SelectItem>
                          <SelectItem value="innovative">Innovative</SelectItem>
                          <SelectItem value="trustworthy">Trustworthy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="brand_primary_color">Primary Color</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="color"
                          id="brand_primary_color"
                          value={profile.brand_primary_color || "#3F55FF"}
                          onChange={(e) => handleInputChange('brand_primary_color', e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={profile.brand_primary_color || "#3F55FF"}
                          onChange={(e) => handleInputChange('brand_primary_color', e.target.value)}
                          placeholder="#3F55FF"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="brand_secondary_color">Secondary Color</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="color"
                          id="brand_secondary_color"
                          value={profile.brand_secondary_color || "#C6FF4E"}
                          onChange={(e) => handleInputChange('brand_secondary_color', e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={profile.brand_secondary_color || "#C6FF4E"}
                          onChange={(e) => handleInputChange('brand_secondary_color', e.target.value)}
                          placeholder="#C6FF4E"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="brand_accent_color">Accent Color</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="color"
                          id="brand_accent_color"
                          value={profile.brand_accent_color || "#FF5F5A"}
                          onChange={(e) => handleInputChange('brand_accent_color', e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={profile.brand_accent_color || "#FF5F5A"}
                          onChange={(e) => handleInputChange('brand_accent_color', e.target.value)}
                          placeholder="#FF5F5A"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-slate-900">Ready to Launch!</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Once you complete this setup, you'll have access to our AI-powered marketing tools designed specifically for your business.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!isStepValid() || saving}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white flex items-center gap-2"
            >
              {saving ? "Completing..." : "Complete Setup"}
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
