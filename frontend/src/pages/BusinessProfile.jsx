import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { BusinessProfile as BusinessProfileEntity } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Upload, Palette, Type, MessageSquare, Save, CheckCircle, Camera, Globe, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function BusinessProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const profiles = await BusinessProfileEntity.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        // Create a new profile if none exists
        setProfile({
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
          setup_completed: false,
          brand_logo_url: "",
          brand_primary_color: "#3F55FF",
          brand_secondary_color: "#C6FF4E",
          brand_accent_color: "#FF5F5A",
          brand_slogan: "",
          brand_font_family: "inter",
          brand_tone: "professional"
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load profile data");
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

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('brand_logo_url', file_url);
      toast.success("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile.id) {
        await BusinessProfileEntity.update(profile.id, profile);
        toast.success("Profile updated successfully!");
      } else {
        const newProfile = await BusinessProfileEntity.create(profile);
        setProfile(newProfile);
        toast.success("Profile created successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
    setSaving(false);
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-none mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-slate-900">Business Profile</h1>
            <p className="text-slate-600">Manage your business information and brand identity</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Brand Identity
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="card-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      value={profile?.business_name || ""}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_type">Business Type</Label>
                    <Select
                      value={profile?.business_type || ""}
                      onValueChange={(value) => handleInputChange('business_type', value)}
                    >
                      <SelectTrigger>
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
                  <Label htmlFor="industry">Industry/Niche</Label>
                  <Input
                    id="industry"
                    value={profile?.industry || ""}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Real Estate, Beauty, Fitness, SaaS"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select
                      value={profile?.company_size || ""}
                      onValueChange={(value) => handleInputChange('company_size', value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="annual_revenue">Annual Revenue</Label>
                    <Select
                      value={profile?.annual_revenue || ""}
                      onValueChange={(value) => handleInputChange('annual_revenue', value)}
                    >
                      <SelectTrigger>
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
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Textarea
                    id="target_audience"
                    value={profile?.target_audience || ""}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    placeholder="Describe your ideal customer..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brand" className="space-y-6">
            <Card className="card-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="brand_logo">Brand Logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {profile?.brand_logo_url && (
                      <img
                        src={profile.brand_logo_url}
                        alt="Brand logo"
                        className="w-16 h-16 object-contain rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label htmlFor="logo-upload">
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          disabled={uploading}
                          asChild
                        >
                          <span>
                            {uploading ? (
                              <>
                                <Upload className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="brand_slogan">Brand Slogan/Tagline</Label>
                  <Input
                    id="brand_slogan"
                    value={profile?.brand_slogan || ""}
                    onChange={(e) => handleInputChange('brand_slogan', e.target.value)}
                    placeholder="e.g., Just Do It, Think Different"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="brand_primary_color">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="color"
                        id="brand_primary_color"
                        value={profile?.brand_primary_color || "#3F55FF"}
                        onChange={(e) => handleInputChange('brand_primary_color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={profile?.brand_primary_color || "#3F55FF"}
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
                        value={profile?.brand_secondary_color || "#C6FF4E"}
                        onChange={(e) => handleInputChange('brand_secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={profile?.brand_secondary_color || "#C6FF4E"}
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
                        value={profile?.brand_accent_color || "#FF5F5A"}
                        onChange={(e) => handleInputChange('brand_accent_color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={profile?.brand_accent_color || "#FF5F5A"}
                        onChange={(e) => handleInputChange('brand_accent_color', e.target.value)}
                        placeholder="#FF5F5A"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="brand_font_family">Font Family</Label>
                    <Select
                      value={profile?.brand_font_family || "inter"}
                      onValueChange={(value) => handleInputChange('brand_font_family', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="open_sans">Open Sans</SelectItem>
                        <SelectItem value="lato">Lato</SelectItem>
                        <SelectItem value="montserrat">Montserrat</SelectItem>
                        <SelectItem value="source_sans_pro">Source Sans Pro</SelectItem>
                        <SelectItem value="raleway">Raleway</SelectItem>
                        <SelectItem value="nunito">Nunito</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                        <SelectItem value="playfair_display">Playfair Display</SelectItem>
                        <SelectItem value="merriweather">Merriweather</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand_tone">Brand Tone</Label>
                    <Select
                      value={profile?.brand_tone || "professional"}
                      onValueChange={(value) => handleInputChange('brand_tone', value)}
                    >
                      <SelectTrigger>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <Card className="card-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Marketing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="monthly_marketing_budget">Monthly Marketing Budget</Label>
                  <Select
                    value={profile?.monthly_marketing_budget || ""}
                    onValueChange={(value) => handleInputChange('monthly_marketing_budget', value)}
                  >
                    <SelectTrigger>
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

                <div>
                  <Label className="text-base font-medium">Current Advertising Platforms</Label>
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
                      { id: 'none', name: 'None - Just Starting' }
                    ].map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={platform.id}
                          checked={profile?.current_advertising_platforms?.includes(platform.id) || false}
                          onChange={() => handleArrayToggle('current_advertising_platforms', platform.id)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={platform.id} className="text-sm">{platform.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Business Goals</Label>
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
                        <input
                          type="checkbox"
                          id={goal.id}
                          checked={profile?.business_goals?.includes(goal.id) || false}
                          onChange={() => handleArrayToggle('business_goals', goal.id)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={goal.id} className="text-sm">{goal.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card className="card-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={profile?.website_url || ""}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile?.phone || ""}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      value={profile?.address || ""}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {profile?.setup_completed && (
          <Card className="card-brand border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Profile Complete</h3>
                  <p className="text-sm text-green-600">
                    Your business profile is set up and ready for AI-powered marketing campaigns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}