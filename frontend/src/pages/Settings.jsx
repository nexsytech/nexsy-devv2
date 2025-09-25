
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { BusinessProfile } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Building, Bell, Shield, CreditCard } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const profiles = await BusinessProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await BusinessProfile.update(profile.id, profile);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-none mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and business profile</p>
        </div>

        {/* Account Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={user?.full_name || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Contact support to update your account information
            </p>
          </CardContent>
        </Card>

        {/* Business Profile */}
        {profile && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={profile.business_name || ""}
                    onChange={(e) => setProfile({...profile, business_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={profile.business_type || ""}
                    onValueChange={(value) => setProfile({...profile, business_type: value})}
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={profile.website_url || ""}
                    onChange={(e) => setProfile({...profile, website_url: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={profile.address || ""}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="email_notifications" defaultChecked />
                <Label htmlFor="email_notifications">Email notifications for campaign updates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="performance_alerts" defaultChecked />
                <Label htmlFor="performance_alerts">Performance alerts and recommendations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="marketing_tips" defaultChecked />
                <Label htmlFor="marketing_tips">Weekly marketing tips and insights</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="product_updates" />
                <Label htmlFor="product_updates">Product updates and new features</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Free Beta Access</h3>
              <p className="text-slate-600 mb-4">
                You're currently on our free beta plan with unlimited access to all features. 
                We'll notify you before any pricing changes.
              </p>
              <Button variant="outline" className="bg-white">
                View Billing History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Data Export</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Download all your campaign data and business information
                </p>
                <Button variant="outline" size="sm">Export Data</Button>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Delete Account</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
