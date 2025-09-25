import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { ConnectedAccount } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  ArrowLeft,
  Target,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Pause,
  Edit,
  Code,
  Copy,
  ChevronDown,
  AlertTriangle,
  PlayCircle,
  Info
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { toast } from 'sonner';

export default function AdVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState(null);
  const [adGroupData, setAdGroupData] = useState(null);
  const [adData, setAdData] = useState(null);
  const [creativeData, setCreativeData] = useState(null);
  const [rawApiResponse, setRawApiResponse] = useState(null);
  const [error, setError] = useState(null);

  // Get launch results from URL params or navigation state
  const urlParams = new URLSearchParams(location.search);
  const campaignId = urlParams.get('campaignId');
  const adGroupId = urlParams.get('adGroupId');
  const adId = urlParams.get('adId');
  const launchMode = urlParams.get('mode') || 'sandbox';

  useEffect(() => {
    if (campaignId && adGroupId && adId) {
      loadAdDetails();
      // Show success toast
      toast.success("✅ Ad successfully launched!", {
        description: launchMode === 'sandbox' ? "This is a sandbox preview; metrics and clicks are simulated." : "Your live campaign is now active.",
      });
    } else {
      setError("Missing campaign information. Please launch an ad first.");
      setLoading(false);
    }
  }, [campaignId, adGroupId, adId, launchMode]);

  const loadAdDetails = async () => {
    try {
      const currentUser = await User.me();
      
      // Get access token based on launch mode
      let accessToken;
      let advertiserId;
      
      if (launchMode === 'sandbox') {
        accessToken = "60060ec53e0e86bbce75c42cf68aa34eb06c1ae0";
        advertiserId = "7531972035980328978";
      } else {
        const connectedAccounts = await ConnectedAccount.filter({ 
          created_by: currentUser.email, 
          platform: 'tiktok' 
        });
        if (!connectedAccounts?.length) {
          throw new Error("TikTok account not connected");
        }
        accessToken = connectedAccounts[0].access_token;
        advertiserId = connectedAccounts[0].advertiser_ids?.[0];
      }

      const apiBase = launchMode === 'sandbox' 
        ? "https://sandbox-ads.tiktok.com/open_api/v1.3"
        : "https://business-api.tiktok.com/open_api/v1.3";

      // Fetch campaign details
      const campaignResponse = await fetch(`${apiBase}/campaign/get/?advertiser_id=${advertiserId}&campaign_ids=${JSON.stringify([campaignId])}`, {
        headers: { "Access-Token": accessToken }
      });
      const campaignResult = await campaignResponse.json();
      
      // Fetch ad group details
      const adGroupResponse = await fetch(`${apiBase}/adgroup/get/?advertiser_id=${advertiserId}&adgroup_ids=${JSON.stringify([adGroupId])}`, {
        headers: { "Access-Token": accessToken }
      });
      const adGroupResult = await adGroupResponse.json();
      
      // Fetch ad details
      const adResponse = await fetch(`${apiBase}/ad/get/?advertiser_id=${advertiserId}&ad_ids=${JSON.stringify([adId])}`, {
        headers: { "Access-Token": accessToken }
      });
      const adResult = await adResponse.json();

      if (campaignResult.code === 0) setCampaignData(campaignResult.data?.list?.[0]);
      if (adGroupResult.code === 0) setAdGroupData(adGroupResult.data?.list?.[0]);
      if (adResult.code === 0) {
        const ad = adResult.data?.list?.[0];
        setAdData(ad);
        
        // Extract creative data from ad
        if (ad?.creatives?.length > 0) {
          setCreativeData(ad.creatives[0]);
        }
      }

      // Store raw API responses for debugging
      setRawApiResponse({
        campaign: campaignResult,
        adGroup: adGroupResult,
        ad: adResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error loading ad details:", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handlePauseAd = async () => {
    // TODO: Implement pause functionality
    toast.info("Pause functionality coming soon!");
  };

  const handleCopyPreviewLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Preview link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    // TikTok API returns budget in cents for some regions
    const amount = budget > 1000 ? (budget / 100) : budget;
    return `$${amount.toFixed(2)}`;
  };

  const formatTargeting = (targeting) => {
    if (!targeting) return "Broad targeting";
    
    const parts = [];
    if (targeting.age) parts.push(`Ages: ${targeting.age.join(", ")}`);
    if (targeting.gender && targeting.gender !== 'GENDER_UNLIMITED') {
      parts.push(`Gender: ${targeting.gender.replace('GENDER_', '').toLowerCase()}`);
    }
    if (targeting.locations) parts.push(`Locations: ${targeting.locations.length} selected`);
    
    return parts.length > 0 ? parts.join(" • ") : "Broad targeting";
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} text="Loading ad verification details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Verification Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => navigate(createPageUrl('CampaignLauncher'))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign Launcher
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('CampaignLauncher'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">
              Ad Launch Successful – Review Your Campaign
            </h1>
            <p className="text-slate-600 font-body">
              Here's a quick overview of the ad created in TikTok. This helps ensure the right details were sent and your campaign looks correct.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleCopyPreviewLink} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy Preview Link
          </Button>
          <Button onClick={handlePauseAd} variant="outline">
            <Pause className="w-4 h-4 mr-2" />
            Pause Ad
          </Button>
          <Button onClick={() => navigate(createPageUrl('CampaignLauncher'))} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Ad Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Campaign Summary Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#3F55FF]" />
                Campaign Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-slate-600">Campaign Name</Label>
                <p className="text-lg font-medium text-slate-900">
                  {campaignData?.campaign_name || "Loading..."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Objective</Label>
                  <Badge className="bg-blue-100 text-blue-800 mt-1">
                    {campaignData?.objective_type || "TRAFFIC"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Status</Label>
                  <Badge className={`mt-1 ${
                    campaignData?.status === 'ENABLE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    <PlayCircle className="w-3 h-3 mr-1" />
                    {campaignData?.status === 'ENABLE' ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Daily Budget</Label>
                  <p className="text-lg font-medium text-slate-900 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatBudget(campaignData?.budget)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Budget Mode</Label>
                  <p className="text-sm text-slate-700">
                    {campaignData?.budget_mode === 'BUDGET_MODE_DAY' ? 'Daily' : 'Lifetime'}
                  </p>
                </div>
              </div>

              {launchMode === 'sandbox' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">
                      Sandbox Mode: This is a test environment. Metrics and clicks are simulated.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ad Group Details Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4CAF50]" />
                Ad Group Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-slate-600">Ad Group Name</Label>
                <p className="text-lg font-medium text-slate-900">
                  {adGroupData?.adgroup_name || "Loading..."}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-600">Target Audience</Label>
                <p className="text-sm text-slate-700">
                  {formatTargeting(adGroupData?.targeting)}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-600">Placements</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {adGroupData?.placements?.map((placement, index) => (
                    <Badge key={index} variant="outline">
                      {placement.replace('PLACEMENT_', '')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Optimization Goal</Label>
                  <p className="text-sm text-slate-700">
                    {adGroupData?.optimization_goal || "Traffic"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Bid Strategy</Label>
                  <p className="text-sm text-slate-700">
                    {adGroupData?.billing_event || "CPC"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ad Creative Preview */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF9800]" />
              Ad Creative Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Creative Preview */}
              <div>
                <Label className="text-sm font-semibold text-slate-600 mb-3 block">Visual Preview</Label>
                <div className="bg-black rounded-2xl p-4 text-white max-w-sm">
                  <div className="text-center mb-2">
                    <p className="text-xs text-gray-400">TikTok Ad Preview</p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl overflow-hidden">
                    <div className="aspect-[9/16] bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center relative">
                      {creativeData?.image_url ? (
                        <img 
                          src={creativeData.image_url} 
                          alt="Ad Creative"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-500 text-center">
                          <Eye className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Creative Loading...</p>
                        </div>
                      )}
                      
                      {/* Ad Content Overlay */}
                      {creativeData && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="space-y-2">
                            <p className="text-white text-sm font-semibold leading-tight">
                              {creativeData.ad_text || "Ad text loading..."}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold">
                                {creativeData.call_to_action || "Learn More"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad Copy Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600">Ad Name</Label>
                  <p className="text-lg font-medium text-slate-900">
                    {adData?.ad_name || "Loading..."}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-600">Ad Text</Label>
                  <p className="text-slate-700 leading-relaxed">
                    {creativeData?.ad_text || "Loading ad text..."}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-600">Call to Action</Label>
                  <Badge className="bg-[#3F55FF] text-white">
                    {creativeData?.call_to_action || "SHOP_NOW"}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-600">Landing Page</Label>
                  <p className="text-sm text-slate-700 break-all">
                    {creativeData?.landing_page_url || "#"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-600">Display Name</Label>
                  <p className="text-sm text-slate-700">
                    {creativeData?.display_name || "Business Name"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Data Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-[#7E57C2]" />
              Technical Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  View Raw API Response
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">
                    {rawApiResponse ? JSON.stringify(rawApiResponse, null, 2) : "Loading..."}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Campaign ID</Label>
                <p className="text-slate-900 font-mono">{campaignId}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Ad Group ID</Label>
                <p className="text-slate-900 font-mono">{adGroupId}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Ad ID</Label>
                <p className="text-slate-900 font-mono">{adId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap justify-center gap-4 pt-8">
          <Button 
            onClick={() => navigate(createPageUrl('CampaignLauncher'))}
            className="bg-[#3F55FF] hover:bg-[#3F55FF]/90 text-white"
          >
            Launch Another Campaign
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Code className="w-4 h-4 mr-2" />
                View API Logs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-96">
              <DialogHeader>
                <DialogTitle>API Request/Response Logs</DialogTitle>
              </DialogHeader>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {rawApiResponse ? JSON.stringify(rawApiResponse, null, 2) : "No logs available"}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}