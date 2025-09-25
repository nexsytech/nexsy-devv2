
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SimplifiedProduct } from "@/api/entities";
import { CreativeOutput } from "@/api/entities";
import { VisualLibrary } from "@/api/entities";
import { ConnectedAccount } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { initiateTikTokAuth } from "@/api/functions";
import { initiateFacebookAuth } from "@/api/functions";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { toast } from 'sonner';
import { LaunchJob } from "@/api/entities";
import { createFacebookCampaign } from "@/api/functions";
import { createFacebookAdSet } from "@/api/functions";
import { createFacebookAd } from "@/api/functions";
import {
  ArrowLeft,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Rocket,
  ExternalLink,
  Search,
  Filter,
  Package,
  Sparkles,
  Target,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Edit,
  PowerOff,
  Loader2
} from "lucide-react";

const COUNTRIES = [
  { value: "AF", label: "Afghanistan", currency: "AFN" },
  { value: "AL", label: "Albania", currency: "ALL" },
  { value: "DZ", label: "Algeria", currency: "DZD" },
  { value: "AD", label: "Andorra", currency: "EUR" },
  { value: "AO", label: "Angola", currency: "AOA" },
  { value: "AR", label: "Argentina", currency: "ARS" },
  { value: "AM", label: "Armenia", currency: "AMD" },
  { value: "AU", label: "Australia", currency: "AUD" },
  { value: "AT", label: "Austria", currency: "EUR" },
  { value: "AZ", label: "Azerbaijan", currency: "AZN" },
  { value: "BS", label: "Bahamas", currency: "BSD" },
  { value: "BH", label: "Bahrain", currency: "BHD" },
  { value: "BD", label: "Bangladesh", currency: "BDT" },
  { value: "BB", label: "Barbados", currency: "BBD" },
  { value: "BY", label: "Belarus", currency: "BYN" },
  { value: "BE", label: "Belgium", currency: "EUR" },
  { value: "BZ", label: "Belize", currency: "BZD" },
  { value: "BJ", label: "Benin", currency: "XOF" },
  { value: "BT", label: "Bhutan", currency: "BTN" },
  { value: "BO", label: "Bolivia", currency: "BOB" },
  { value: "BA", label: "Bosnia and Herzegovina", currency: "BAM" },
  { value: "BW", label: "Botswana", currency: "BWP" },
  { value: "BR", label: "Brazil", currency: "BRL" },
  { value: "BN", label: "Brunei", currency: "BND" },
  { value: "BG", label: "Bulgaria", currency: "BGN" },
  { value: "BF", label: "Burkina Faso", currency: "XOF" },
  { value: "BI", label: "Burundi", currency: "BIF" },
  { value: "KH", label: "Cambodia", currency: "KHR" },
  { value: "CM", label: "Cameroon", currency: "XAF" },
  { value: "CA", label: "Canada", currency: "CAD" },
  { value: "CL", label: "Chile", currency: "CLP" },
  { value: "CN", label: "China", currency: "CNY" },
  { value: "CO", label: "Colombia", currency: "COP" },
  { value: "CR", label: "Costa Rica", currency: "CRC" },
  { value: "HR", label: "Croatia", currency: "EUR" },
  { value: "CU", label: "Cuba", currency: "CUP" },
  { value: "CY", label: "Cyprus", currency: "EUR" },
  { value: "CZ", label: "Czech Republic", currency: "CZK" },
  { value: "DK", label: "Denmark", currency: "DKK" },
  { value: "DO", label: "Dominican Republic", currency: "DOP" },
  { value: "EC", label: "Ecuador", currency: "USD" },
  { value: "EG", label: "Egypt", currency: "EGP" },
  { value: "EE", label: "Estonia", currency: "EUR" },
  { value: "ET", label: "Ethiopia", currency: "ETB" },
  { value: "FI", label: "Finland", currency: "EUR" },
  { value: "FR", label: "France", currency: "EUR" },
  { value: "DE", label: "Germany", currency: "EUR" },
  { value: "GH", label: "Ghana", currency: "GHS" },
  { value: "GR", label: "Greece", currency: "EUR" },
  { value: "GT", label: "Guatemala", currency: "GTQ" },
  { value: "HN", label: "Honduras", currency: "HNL" },
  { value: "HK", label: "Hong Kong", currency: "HKD" },
  { value: "HU", label: "Hungary", currency: "HUF" },
  { value: "IS", label: "Iceland", currency: "ISK" },
  { value: "IN", label: "India", currency: "INR" },
  { value: "ID", label: "Indonesia", currency: "IDR" },
  { value: "IR", label: "Iran", currency: "IRR" },
  { value: "IQ", label: "Iraq", currency: "IQD" },
  { value: "IE", label: "Ireland", currency: "EUR" },
  { value: "IL", label: "Israel", currency: "ILS" },
  { value: "IT", label: "Italy", currency: "EUR" },
  { value: "JM", label: "Jamaica", currency: "JMD" },
  { value: "JP", label: "Japan", currency: "JPY" },
  { value: "JO", label: "Jordan", currency: "JOD" },
  { value: "KZ", label: "Kazakhstan", currency: "KZT" },
  { value: "KE", "label": "Kenya", currency: "KES" },
  { value: "KW", label: "Kuwait", currency: "KWD" },
  { value: "LV", label: "Latvia", currency: "EUR" },
  { value: "LB", label: "Lebanon", currency: "LBP" },
  { value: "LT", label: "Lithuania", currency: "EUR" },
  { value: "LU", label: "Luxembourg", currency: "EUR" },
  { value: "MY", label: "Malaysia", currency: "MYR" },
  { value: "MT", label: "Malta", currency: "EUR" },
  { value: "MX", label: "Mexico", currency: "MXN" },
  { value: "MA", label: "Morocco", currency: "MAD" },
  { value: "NL", label: "Netherlands", currency: "EUR" },
  { value: "NZ", label: "New Zealand", currency: "NZD" },
  { value: "NG", label: "Nigeria", currency: "NGN" },
  { value: "NO", label: "Norway", currency: "NOK" },
  { value: "PK", label: "Pakistan", currency: "PKR" },
  { value: "PA", label: "Panama", currency: "PAB" },
  { value: "PE", label: "Peru", currency: "PEN" },
  { value: "PH", label: "Philippines", currency: "PHP" },
  { value: "PL", label: "Poland", currency: "PLN" },
  { value: "PT", label: "Portugal", currency: "EUR" },
  { value: "QA", label: "Qatar", currency: "QAR" },
  { value: "RO", label: "Romania", currency: "RON" },
  { value: "RU", label: "Russia", currency: "RUB" },
  { value: "SA", label: "Saudi Arabia", currency: "SAR" },
  { value: "SG", label: "Singapore", currency: "SGD" },
  { value: "SK", label: "Slovakia", currency: "EUR" },
  { value: "SI", label: "Slovenia", currency: "EUR" },
  { value: "ZA", label: "South Africa", currency: "ZAR" },
  { value: "KR", label: "South Korea", currency: "KRW" },
  { value: "ES", label: "Spain", currency: "EUR" },
  { value: "LK", label: "Sri Lanka", currency: "LKR" },
  { value: "SE", label: "Sweden", currency: "SEK" },
  { value: "CH", label: "Switzerland", currency: "CHF" },
  { value: "TW", label: "Taiwan", currency: "TWD" },
  { value: "TH", label: "Thailand", currency: "THB" },
  { value: "TR", label: "Turkey", currency: "TRY" },
  { value: "UA", label: "Ukraine", currency: "UAH" },
  { value: "AE", label: "United Arab Emirates", currency: "AED" },
  { value: "GB", label: "United Kingdom", currency: "GBP" },
  { value: "US", label: "United States", currency: "USD" },
  { value: "UY", label: "Uruguay", currency: "UYU" },
  { value: "VE", label: "Venezuela", currency: "VES" },
  { value: "VN", label: "Vietnam", currency: "VND" }
];

const isTokenValid = (account) => {
  if (!account || !account.access_token_expires_at) return false;
  return new Date(account.access_token_expires_at) > new Date();
};

// Helper function for SHA-256 hashing using the Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function CampaignLauncher() {
  const navigate = useNavigate();
  const location = useLocation();
  console.log("CampaignLauncher loaded. Current location.search:", location.search);

  // State for the main view
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [tiktokAdAccounts, setTiktokAdAccounts] = useState([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState('');

  // State for campaign launch modal/overlay
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [creativeOutputs, setCreativeOutputs] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCreative, setSelectedCreative] = useState(null); // { creativeId, copyIndex }
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState('image'); // State for visual media type
  const [isLaunching, setIsLaunching] = useState(false); // Kept to disable button during launch prep
  const [launchMode, setLaunchMode] = useState('sandbox');
  
  // State for editing ad copy
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCopy, setEditingCopy] = useState(null);
  const [tempEditedCopy, setTempEditedCopy] = useState({ headline: '', body_text: '', call_to_action: '' });

  // Campaign settings
  const [campaignSettings, setCampaignSettings] = useState({
    campaign_name: '',
    daily_budget: '',
    campaign_duration: '7',
    target_country_code: 'MY', // Will be auto-populated
    target_age_min: '18',
    target_age_max: '65',
    target_gender: 'GENDER_UNLIMITED'
  });

  useEffect(() => {
    console.log("[CampaignLauncher Page] Page loaded with URL search params:", location.search);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [userProducts, accounts] = await Promise.all([
        SimplifiedProduct.filter({ created_by: currentUser.email }, '-updated_date'),
        ConnectedAccount.filter({ created_by: currentUser.email })
      ]);
      
      console.log("loadData: User products loaded:", userProducts);
      setProducts(userProducts || []);

      const accountsMap = {};
      accounts.forEach((acc) => {
        accountsMap[acc.platform] = acc;
      });
      setConnectedAccounts(accountsMap);

      if (isTokenValid(accountsMap.tiktok)) {
        setTiktokAdAccounts(accountsMap.tiktok.advertiser_ids || []);
        if (accountsMap.tiktok.advertiser_ids?.length > 0) {
          setSelectedAdAccount(accountsMap.tiktok.advertiser_ids[0]);
        }
      }

    } catch (error) {
      console.error("loadData: Error loading data:", error);
      toast.error("Failed to load your data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we should directly launch for a specific product from another page
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    console.log("useEffect [location.search, products]: Product ID from URL:", productId, "Products state count:", products.length);
    
    if (productId && products.length > 0) {
      const productToLaunch = products.find(p => p.id === productId);
      if (productToLaunch) {
        console.log("Product found in state, launching campaign for:", productToLaunch.product_name);
        handleLaunchCampaignForProduct(productToLaunch);
      } else {
        console.log("Product not found in state, attempting direct fetch");
        // Only trigger direct fetch if product is not found in already loaded products
        // And ensure user is loaded before proceeding with fetch that depends on user.email
        if (user) {
          handleLaunchCampaignForProduct({ id: productId });
        }
      }
    } else if (productId && !products.length && !loading) { // If products haven't loaded yet or product list is empty
      // This case might occur if product list is empty or still loading, but a product ID is in URL
      // We need to wait for `products` to be populated or fetch directly if not.
      // This is handled by the `user` check in the above block or within `handleLaunchCampaignForProduct` itself.
      // No explicit action here, as the `products.length > 0` condition handles the common case
      // and `handleLaunchCampaignForProduct` is robust enough to fetch.
    }

  }, [location.search, products, user, loading]); // Added 'user' and 'loading' to dependencies

  const handleLaunchCampaignForProduct = async (product) => {
    console.log("handleLaunchCampaignForProduct called for product:", product);
    
    let selectedProduct = product;
    
    // If we only have an ID, fetch the full product using filter for reliability
    if (typeof product === 'object' && product.id && !product.product_name) {
      console.log("handleLaunchCampaignForProduct: Product incomplete, fetching full data");
      try {
        const currentUser = user || await User.me();
        const allProducts = await SimplifiedProduct.filter({ created_by: currentUser.email });
        
        // DIAGNOSTIC LOGS START
        console.log("CampaignLauncher: Looking for product with ID:", product.id);
        console.log("CampaignLauncher: All products from filter:", allProducts);
        selectedProduct = allProducts.find(p => p.id === product.id);
        console.log("CampaignLauncher: Result of find operation:", selectedProduct);
        // DIAGNOSTIC LOGS END
        
        if (!selectedProduct) {
          console.log("handleLaunchCampaignForProduct: Product not found in filter results.");
          toast.error("Product not found. Please try again.");
          navigate(createPageUrl("YourProducts"));
          return;
        }
        
        console.log("handleLaunchCampaignForProduct: Found product in filter results:", !!selectedProduct);
      } catch (error) {
        console.error("handleLaunchCampaignForProduct: Error fetching product:", error);
        toast.error("Failed to load product. Please try again.");
        navigate(createPageUrl("YourProducts"));
        return;
      }
    }

    if (!selectedProduct || !selectedProduct.id) {
      console.error("handleLaunchCampaignForProduct: Invalid product object:", selectedProduct);
      toast.error("Invalid product data. Please try again.");
      navigate(createPageUrl("YourProducts"));
      return;
    }

    setSelectedProduct(selectedProduct);
    setShowLaunchModal(true);
    
    const productCountry = selectedProduct.target_country_code || 'US';
    setCampaignSettings(prev => ({
      ...prev,
      campaign_name: `${selectedProduct.product_name} Campaign`,
      target_country_code: launchMode === 'sandbox' ? 'MY' : productCountry
    }));

    try {
      const [creatives, visualData] = await Promise.all([
         CreativeOutput.filter({ product_id: selectedProduct.id }),
         VisualLibrary.filter({ product_id: selectedProduct.id })
      ]);

      setCreativeOutputs(creatives);
      if (creatives.length > 0 && creatives[0].ad_copies.length > 0) {
        setSelectedCreative({ creativeId: creatives[0].id, copyIndex: 0 });
      } else {
        setSelectedCreative(null);
      }

      setVisuals(visualData);
      if (visualData.length > 0) {
        setSelectedVisual(visualData[0]);
        setSelectedMediaType(visualData[0].media_type); // Set media type based on first visual
      } else {
        setSelectedVisual(null);
        setSelectedMediaType('image'); // Default to image if no visuals
      }

    } catch (error) {
      console.error("handleLaunchCampaignForProduct: Error loading creative data:", error);
      toast.error("Could not load campaign data. Please try again.");
    }
  };
  
  const handleEditCopy = (creativeId, copyIndex) => {
    const creative = creativeOutputs.find(c => c.id === creativeId);
    const copy = creative?.ad_copies[copyIndex];
    if (copy) {
      setEditingCopy({ creativeId, copyIndex, ...copy });
      setTempEditedCopy({
        headline: copy.headline,
        body_text: copy.body_text,
        call_to_action: copy.call_to_action,
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEditedCopy = () => {
    if (!editingCopy) return;

    setCreativeOutputs(prevCreatives => 
      prevCreatives.map(c => {
        if (c.id === editingCopy.creativeId) {
          const newAdCopies = [...c.ad_copies];
          newAdCopies[editingCopy.copyIndex] = {
            ...newAdCopies[editingCopy.copyIndex],
            ...tempEditedCopy,
          };
          return { ...c, ad_copies: newAdCopies };
        }
        return c;
      })
    );

    setShowEditModal(false);
    setEditingCopy(null);
    toast.success("Ad copy updated for this session.");
  };

  const handleTikTokConnect = async () => {
    try {
      const { data, error } = await initiateTikTokAuth({ returnUrl: window.location.href });
      if (error || !data?.authUrl) {
        throw new Error(error?.message || "Could not initiate TikTok connection.");
      }
      window.location.href = data.authUrl;
    } catch (err) {
      console.error("TikTok connection error:", err);
      toast.error(`TikTok connection failed: ${err.message}`);
    }
  };

  const handleFacebookConnect = async () => {
    try {
      const { data } = await initiateFacebookAuth({ returnUrl: window.location.href });
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error("Could not initiate Facebook connection.");
      }
    } catch (error) {
      console.error("Facebook connection error:", error);
      toast.error("Facebook connection failed.");
    }
  };

  const handleTikTokDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your TikTok account?")) return;
    try {
        const account = connectedAccounts.tiktok;
        if (account) {
            await ConnectedAccount.delete(account.id);
            setConnectedAccounts(prev => ({...prev, tiktok: null}));
            toast.success("TikTok account disconnected successfully.");
            setTiktokAdAccounts([]);
            setSelectedAdAccount('');
        }
    } catch (error) {
        console.error("TikTok disconnect error:", error);
        toast.error("Failed to disconnect TikTok account.");
    }
  };
  
  const handleFacebookDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Meta account?")) return;
    try {
        const account = connectedAccounts.facebook;
        if (account) {
            await ConnectedAccount.delete(account.id);
            setConnectedAccounts(prev => ({...prev, facebook: null}));
            toast.success("Meta account disconnected successfully.");
        }
    } catch (error) {
        console.error("Meta disconnect error:", error);
        toast.error("Failed to disconnect Meta account.");
    }
  };

  const handleLaunchTikTokCampaign = async () => {
    // Disable button immediately to prevent double-clicks
    setIsLaunching(true);

    if (launchMode === 'live' && !isTokenValid(connectedAccounts.tiktok)) {
        toast.error("Your TikTok connection has expired or is invalid. Please reconnect.");
        setIsLaunching(false);
        return;
    }
    if (launchMode === 'live' && !selectedAdAccount) { 
        toast.error("Please select a TikTok Ad Account for live campaigns.");
        setIsLaunching(false);
        return;
    }
    if (!selectedProduct || !selectedCreative || !selectedVisual) {
      toast.error("Please ensure all campaign elements are selected.");
      setIsLaunching(false);
      return;
    }

    // FIX: Add comprehensive validation and logging for asset_url
    if (!selectedVisual || !selectedVisual.asset_url) {
      console.error("Selected visual is missing or has no asset_url:", selectedVisual);
      toast.error("Selected visual is missing or invalid. Please select a different visual.");
      setIsLaunching(false);
      return;
    }

    console.log("Campaign launch - Selected visual:", selectedVisual);
    console.log("Campaign launch - Asset URL:", selectedVisual.asset_url);

    // 1. Generate Idempotency Key on the Frontend
    const idempotencySource = `${user.id}-${selectedProduct.id}-${launchMode}-${new Date().toISOString()}`;
    const idempotencyKey = await sha256(idempotencySource);

    const creative = creativeOutputs.find(c => c.id === selectedCreative.creativeId);
    const adCopy = creative?.ad_copies[selectedCreative.copyIndex];

    const selectedCountry = COUNTRIES.find((c) => c.value === campaignSettings.target_country_code);
    const budgetCurrency = launchMode === 'sandbox' ? 'MYR' : selectedCountry?.currency || 'USD';

    const campaignConfig = {
      idempotency_key: idempotencyKey,
      product_id: selectedProduct.id,
      launch_mode: launchMode,
      advertiser_id: launchMode === 'live' ? selectedAdAccount : undefined,
      campaign_name: campaignSettings.campaign_name,
      daily_budget: parseFloat(campaignSettings.daily_budget),
      budget_currency: budgetCurrency,
      target_country_code: campaignSettings.target_country_code,
      target_gender: campaignSettings.target_gender,
      target_age_min: campaignSettings.target_age_min,
      target_age_max: campaignSettings.target_age_max,
      asset_url: selectedVisual.asset_url, // FIX: Ensure this is always set
      media_type: selectedVisual.media_type,
      product_name: selectedProduct.product_name,
      ad_copy: adCopy,
      product_link: selectedProduct.product_link,
      campaign_duration: parseInt(campaignSettings.campaign_duration, 10),
      // FIX: Changed property name from profile_image_url to product_image_url to match what the next step expects.
      product_image_url: selectedProduct.product_image_url 
    };
    
    // FIX: Add final validation before navigation
    console.log("Final campaign config:", campaignConfig);
    
    if (!campaignConfig.asset_url) {
      console.error("Campaign config missing asset_url after construction");
      toast.error("Campaign configuration error. Please try selecting your visual again.");
      setIsLaunching(false);
      return;
    }
    
    // FIX: Navigate with idempotency key in the URL to ensure retries use the same job
    const url = createPageUrl(`CampaignStatusTracker?key=${campaignConfig.idempotency_key}`);
    navigate(url, { state: { campaignConfig } });
  };
  
  const handleLaunchFacebookCampaign = async () => {
    setIsLaunching(true);

    if (!selectedProduct || !selectedCreative || !selectedVisual) {
      toast.error("Please ensure all campaign elements are selected.");
      setIsLaunching(false);
      return;
    }

    if (!connectedAccounts.facebook || !isTokenValid(connectedAccounts.facebook)) {
      toast.error("Please connect your Facebook account first.");
      setIsLaunching(false);
      return;
    }

    const adAccount = connectedAccounts.facebook.advertiser_ids?.[0]; // Assuming advertiser_ids stores the ad account ID
    if (!adAccount) {
      toast.error("No Facebook ad account found. Please ensure your account has ad accounts.");
      setIsLaunching(false);
      return;
    }

    try {
      const creative = creativeOutputs.find(c => c.id === selectedCreative.creativeId);
      const adCopy = creative?.ad_copies[selectedCreative.copyIndex];

      // Step 1: Create Campaign
      toast.info("Creating Facebook campaign...");
      const { data: campaignResult } = await createFacebookCampaign({
        ad_account_id: adAccount,
        campaign_name: campaignSettings.campaign_name,
        objective: "TRAFFIC"
      });

      // Step 2: Create Ad Set with targeting
      toast.info("Creating ad set with targeting...");
      const targeting = {
        geo_locations: {
          countries: [campaignSettings.target_country_code]
        },
        age_min: parseInt(campaignSettings.target_age_min),
        age_max: parseInt(campaignSettings.target_age_max),
        genders: campaignSettings.target_gender === 'GENDER_UNLIMITED' ? undefined : 
                campaignSettings.target_gender === 'GENDER_MALE' ? [1] : [2] // 1 for male, 2 for female in Facebook API
      };

      const { data: adsetResult } = await createFacebookAdSet({
        ad_account_id: adAccount,
        campaign_id: campaignResult.campaign_id,
        adset_name: `${selectedProduct.product_name} AdSet`,
        daily_budget: parseFloat(campaignSettings.daily_budget),
        targeting: targeting
      });

      // Step 3: Create Ad
      toast.info("Creating Facebook ad...");
      
      // For Facebook, we need a page ID - this would need to be obtained during connection
      // For now, we'll use a placeholder approach
      // In a real application, connectedAccounts.facebook should ideally store page_id
      const pageId = connectedAccounts.facebook.page_id || "YOUR_PAGE_ID"; 
      
      const adCreativePayload = {
        page_id: pageId, // This should be obtained from Facebook connection
        link_url: selectedProduct.product_link,
        message: adCopy.body_text,
        headline: adCopy.headline,
        description: selectedProduct.what_is_it, // Using product description as ad description
        image_url: selectedVisual.asset_url,
        call_to_action: adCopy.call_to_action || 'LEARN_MORE' // Default CTA
      };

      const { data: adResult } = await createFacebookAd({
        ad_account_id: adAccount,
        adset_id: adsetResult.adset_id,
        ad_name: `${selectedProduct.product_name} Ad`,
        creative: adCreativePayload
      });

      toast.success("Facebook campaign created successfully!");
      
      // Navigate to verification page
      navigate(createPageUrl(`AdVerification?campaignId=${campaignResult.campaign_id}&adsetId=${adsetResult.adset_id}&adId=${adResult.ad_id}&mode=facebook`));

    } catch (error) {
      console.error("Facebook campaign launch error:", error);
      toast.error(`Failed to launch Facebook campaign: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsLaunching(false);
    }
  };
  
  const getSelectedAdCopy = () => {
      if (!selectedCreative) return null;
      const creative = creativeOutputs.find(c => c.id === selectedCreative.creativeId);
      return creative?.ad_copies[selectedCreative.copyIndex];
  };

  const filteredProducts = products.filter((product) =>
  product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.what_is_it?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner fullPage text="Loading your products..." />;
  }
  
  // If showing launch modal for specific product - VERTICAL LAYOUT
  if (showLaunchModal && selectedProduct) {
    const selectedCountry = COUNTRIES.find((c) => c.value === campaignSettings.target_country_code) || COUNTRIES[0];
    const displayCurrency = launchMode === 'sandbox' ? 'MYR' : selectedCountry.currency;
    const effectiveMinBudget = 50; // UPDATED: Set to 50 for both sandbox and live modes to meet API requirements.

    return (
      <>
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <Button variant="outline" onClick={() => setShowLaunchModal(false)} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">Launch Campaign</h1>
                <p className="text-slate-600">Configure and launch your campaign for {selectedProduct.product_name}</p>
              </div>
            </div>

            {/* NEW: Add Connection Status section at the top of product-specific launch */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#3F55FF]" />
                  Connect Your Ad Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* TikTok Connection Card */}
                  <div className="bg-black rounded-lg p-6 text-center text-white flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">TikTok</h3>
                      <p className="text-xs text-gray-300 mb-2">Short video ads</p>
                      {connectedAccounts.tiktok ? (
                        isTokenValid(connectedAccounts.tiktok) ? (
                          <Badge className="bg-green-100 text-green-800 mb-3">Connected</Badge>
                        ) : (
                          <Badge variant="destructive" className="mb-3">Expired</Badge>
                        )
                      ) : (
                         <Badge variant="outline" className="mb-3 border-gray-500 text-gray-400">Not Connected</Badge>
                      )}
                    </div>
                    <div className="mt-auto space-y-2">
                      {connectedAccounts.tiktok ? (
                        isTokenValid(connectedAccounts.tiktok) ? (
                          <Button variant="outline" onClick={handleTikTokDisconnect} className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/40 hover:text-white border-red-500/40">
                            <PowerOff className="w-4 h-4 mr-2" /> Disconnect
                          </Button>
                        ) : (
                          <Button onClick={handleTikTokConnect} className="w-full bg-white text-black hover:bg-gray-100">
                            Reconnect
                          </Button>
                        )
                      ) : (
                        <Button onClick={handleTikTokConnect} className="w-full bg-white text-black hover:bg-gray-100">
                          Connect
                        </Button>
                      )}
                      <div>
                        <p className="text-xs">Need a TikTok Ads account?</p>
                        <a href="https://ads.tiktok.com/" target="_blank" rel="noopener noreferrer" className="underline text-xs hover:opacity-80">
                          Sign up for TikTok Ads →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Meta Connection Card */}
                  <div className="bg-blue-600 rounded-lg p-6 text-center text-white flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Meta</h3>
                      <p className="text-xs text-blue-200 mb-2">Facebook & Instagram ads</p>
                      {connectedAccounts.facebook ? (
                        isTokenValid(connectedAccounts.facebook) ? (
                          <Badge className="bg-green-100 text-green-800 mb-3">Connected</Badge>
                        ) : (
                          <Badge variant="destructive" className="mb-3">Expired</Badge>
                        )
                      ) : (
                         <Badge variant="outline" className="mb-3 border-blue-300 text-blue-200">Not Connected</Badge>
                      )}
                    </div>
                    <div className="mt-auto space-y-2">
                      {connectedAccounts.facebook ? (
                          isTokenValid(connectedAccounts.facebook) ? (
                          <Button variant="outline" onClick={handleFacebookDisconnect} className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/40 hover:text-white border-red-500/40">
                               <PowerOff className="w-4 h-4 mr-2" /> Disconnect
                          </Button>
                          ) : (
                          <Button onClick={handleFacebookConnect} className="w-full bg-white text-blue-600 hover:bg-gray-100">
                              Reconnect
                          </Button>
                          )
                      ) : (
                          <Button onClick={handleFacebookConnect} className="w-full bg-white text-blue-600 hover:bg-gray-100">
                          Connect
                          </Button>
                      )}
                      <div>
                        <p className="text-xs opacity-80">Need a Meta Business account?</p>
                        <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-white underline text-xs hover:opacity-80">
                          Sign up for Meta Business →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Status Info */}
                {!connectedAccounts.tiktok && !connectedAccounts.facebook && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        <strong>Connect at least one platform</strong> to launch your campaign. You can always connect more later.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* VERTICAL LAYOUT - STEP BY STEP */}
            <div className="space-y-8">
              
              {/* Step 1: Platform Selection */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">1</span>
                    Select Platform
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPlatform === 'tiktok' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                      onClick={() => setSelectedPlatform('tiktok')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center p-1">
                          <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold">TikTok</p>
                          <p className="text-xs text-slate-500">Short video ads</p>
                        </div>
                        {selectedPlatform === 'tiktok' && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPlatform === 'facebook' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedPlatform('facebook')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold">Meta</p>
                          <p className="text-xs text-slate-500">Facebook & Instagram ads</p>
                        </div>
                        {selectedPlatform === 'facebook' && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Choose Ad Copy */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      selectedPlatform ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>2</span>
                    Choose Ad Copy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creativeOutputs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {creativeOutputs.flatMap((creative) => 
                        creative.ad_copies.map((copy, copyIndex) => (
                          <Card 
                            key={`${creative.id}-${copyIndex}`}
                            className={`cursor-pointer transition-all border-2 h-full flex flex-col ${
                              selectedCreative?.creativeId === creative.id && selectedCreative?.copyIndex === copyIndex
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                            onClick={() => setSelectedCreative({creativeId: creative.id, copyIndex: copyIndex})}
                          >
                            <CardContent className="p-6 flex-grow flex flex-col">
                              <h3 className="font-semibold text-slate-800 mb-2 flex-shrink-0">{copy.headline}</h3>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">{copy.body_text}</p>
                              <div className="flex justify-between items-center mt-auto pt-2">
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                                  {copy.call_to_action}
                                </Badge>
                                {selectedCreative?.creativeId === creative.id && selectedCreative?.copyIndex === copyIndex && (
                                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No ad copies found for this product</p>
                  )}
                </CardContent>
              </Card>

              {/* Step 3: Choose Visual */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      selectedCreative ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>3</span>
                    Choose Visual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visuals.length > 0 ? (
                    <div className="space-y-4">
                      {/* Media Type Selection Buttons */}
                      <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-100 w-fit">
                        <Button
                          size="sm"
                          onClick={() => setSelectedMediaType('image')}
                          variant={selectedMediaType === 'image' ? 'default' : 'ghost'}
                          className="rounded-md px-4 py-2"
                        >
                          📸 Images
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedMediaType('video')}
                          variant={selectedMediaType === 'video' ? 'default' : 'ghost'}
                          className="rounded-md px-4 py-2"
                        >
                          🎬 Videos
                        </Button>
                      </div>

                      {/* Filtered Visual Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {visuals
                          .filter(v => v.media_type === selectedMediaType)
                          .map((v) => (
                            <button 
                              key={v.id} 
                              onClick={() => setSelectedVisual(v)} 
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                                selectedVisual?.id === v.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-indigo-200'
                              }`}
                            >
                              {v.media_type === 'video' ? (
                                <div className="relative w-full h-full">
                                  <video src={v.asset_url} className="w-full h-full object-cover" muted />
                                  {/* Video play indicator */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                      <div className="w-0 h-0 border-l-[12px] border-l-slate-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <img src={v.asset_url} alt={v.title} className="w-full h-full object-cover" />
                              )}
                              
                              {/* Selected indicator */}
                              {selectedVisual?.id === v.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </button>
                          ))
                        }
                      </div>

                      {/* Show message if no visuals of selected type */}
                      {visuals.filter(v => v.media_type === selectedMediaType).length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">
                            No {selectedMediaType}s available for this product.
                            {selectedMediaType === 'video' ? ' Try generating some videos first.' : ' Try generating some images first.'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No visuals found for this product</p>
                  )}
                </CardContent>
              </Card>

              {/* Ad Preview Section */}
              {selectedPlatform && getSelectedAdCopy() && selectedVisual && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-600" />
                        Ad Preview
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCopy(selectedCreative.creativeId, selectedCreative.copyIndex)}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="bg-black rounded-2xl p-4 text-white max-w-xs w-full">
                      <div className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden relative">
                        {selectedVisual.media_type === 'video' ? (
                            <video 
                                src={selectedVisual.asset_url} 
                                alt="Ad Preview"
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <img 
                                src={selectedVisual.asset_url} 
                                alt="Ad Preview"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                           <p className="text-white text-xs font-semibold leading-tight mb-2">
                            {getSelectedAdCopy()?.headline}
                          </p>
                          <p className="text-white text-xs leading-tight">
                            {getSelectedAdCopy()?.body_text}
                          </p>
                          <div className="mt-2">
                            <div className="bg-white text-black px-2 py-1 rounded-full text-xs font-semibold inline-block">
                              {getSelectedAdCopy()?.call_to_action || 'Shop Now'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Campaign Settings */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      selectedVisual ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>4</span>
                    Campaign Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="campaign_name">Campaign Name</Label>
                    <Input
                      id="campaign_name"
                      value={campaignSettings.campaign_name}
                      onChange={(e) => setCampaignSettings((prev) => ({ ...prev, campaign_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Mode</Label>
                    <div className="flex items-center gap-2 p-1 rounded-full bg-slate-100 w-min">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setLaunchMode('sandbox');
                          setCampaignSettings(prev => ({...prev, target_country_code: 'MY'}));
                        }} 
                        variant={launchMode === 'sandbox' ? 'default' : 'ghost'} 
                        className="rounded-full"
                      >
                        Test Mode
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setLaunchMode('live');
                          setCampaignSettings(prev => ({...prev, target_country_code: selectedProduct.target_country_code || 'US'}));
                        }} 
                        variant={launchMode === 'live' ? 'default' : 'ghost'} 
                        className="rounded-full"
                      >
                        Live Mode
                      </Button>
                    </div>
                  </div>

                  {/* Ad Account Selection for Live Mode */}
                  {launchMode === 'live' && selectedPlatform === 'tiktok' && (
                    <div>
                        <Label htmlFor="ad_account">TikTok Ad Account</Label>
                        <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                            <SelectTrigger id="ad_account" className="mt-1 h-10">
                                <SelectValue placeholder="Select an Ad Account" />
                            </SelectTrigger>
                            <SelectContent>
                                {tiktokAdAccounts.length > 0 ? tiktokAdAccounts.map(id => (
                                    <SelectItem key={id} value={id}>{id}</SelectItem>
                                )) : <SelectItem value="none" disabled>No ad accounts found</SelectItem>}
                            </SelectContent>
                        </Select>
                        {!isTokenValid(connectedAccounts.tiktok) && (
                            <p className="text-xs text-red-600 mt-1">
                                TikTok connection has expired. Please reconnect.
                            </p>
                        )}
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-6 items-start">
                    <div className="flex flex-col">
                      <Label htmlFor="daily_budget">Daily Budget ({displayCurrency}) *</Label>
                      <Input
                        id="daily_budget"
                        type="number"
                        min={effectiveMinBudget}
                        step="1"
                        value={campaignSettings.daily_budget}
                        onChange={(e) => setCampaignSettings((prev) => ({ ...prev, daily_budget: e.target.value }))}
                        placeholder={effectiveMinBudget.toString()}
                        className="mt-1 h-10"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Minimum {effectiveMinBudget} {displayCurrency}/day
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <Label htmlFor="campaign_duration">
                        <div className="flex items-center gap-1.5">
                          Campaign Duration (Days)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                                  <Info className="w-4 h-4 text-slate-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">We recommend at least 7 days for the AI to optimize and find the best audience.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </Label>
                      <Input
                        id="campaign_duration"
                        type="number"
                        min="1"
                        value={campaignSettings.campaign_duration}
                        onChange={(e) => setCampaignSettings((prev) => ({ ...prev, campaign_duration: e.target.value }))}
                        className="mt-1 h-10"
                      />
                    </div>

                    <div className="flex flex-col">
                      <Label className="text-sm font-normal">Target Country</Label>
                      <Input 
                        value={launchMode === 'sandbox' ? 'Malaysia' : (selectedCountry?.label || 'Unknown')}
                        disabled 
                        className="mt-1 bg-slate-50 h-10"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {launchMode === 'sandbox' ? 'Fixed to Malaysia for testing' : 'From product settings'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col">
                      <Label className="text-sm font-normal">Age Range</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Select value={campaignSettings.target_age_min} onValueChange={(val) => setCampaignSettings((p) => ({ ...p, target_age_min: val }))}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 48 }, (_, i) => i + 18).map((age) => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <span>-</span>
                        <Select value={campaignSettings.target_age_max} onValueChange={(val) => setCampaignSettings((p) => ({ ...p, target_age_max: val }))}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 48 }, (_, i) => i + 18).map((age) => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <Label className="text-sm font-normal">Target Gender</Label>
                      <Select value={campaignSettings.target_gender} onValueChange={(val) => setCampaignSettings((p) => ({ ...p, target_gender: val }))}>
                        <SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENDER_UNLIMITED">All</SelectItem>
                          <SelectItem value="GENDER_MALE">Male</SelectItem>
                          <SelectItem value="GENDER_FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Launch Button */}
              <div className="flex justify-center pt-8 space-x-4">
                {selectedPlatform === 'tiktok' && (
                  <Button
                    onClick={handleLaunchTikTokCampaign}
                    disabled={isLaunching || !campaignSettings.daily_budget || !selectedCreative || !selectedVisual || !selectedPlatform || (launchMode === 'live' && !selectedAdAccount)} 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-12 py-3"
                  >
                    {isLaunching ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Launching...</> : <><Rocket className="w-5 h-5 mr-2" />Launch TikTok Campaign</>}
                  </Button>
                )}
                
                {selectedPlatform === 'facebook' && (
                  <Button
                    onClick={handleLaunchFacebookCampaign}
                    disabled={isLaunching || !campaignSettings.daily_budget || !selectedCreative || !selectedVisual || !selectedPlatform} 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3"
                  >
                    {isLaunching ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Launching...</> : <><Rocket className="w-5 h-5 mr-2" />Launch Facebook Campaign</>}
                  </Button>
                )}
              </div>
            </div>
          
        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Ad Copy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-headline">Headline</Label>
                <Input
                  id="edit-headline"
                  value={tempEditedCopy.headline}
                  onChange={(e) => setTempEditedCopy(p => ({ ...p, headline: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-body">Body Text</Label>
                <Textarea
                  id="edit-body"
                  value={tempEditedCopy.body_text}
                  onChange={(e) => setTempEditedCopy(p => ({ ...p, body_text: e.target.value }))}
                  className="h-24"
                />
              </div>
              <div>
                <Label htmlFor="edit-cta">Call to Action</Label>
                <Input
                  id="edit-cta"
                  value={tempEditedCopy.call_to_action}
                  onChange={(e) => setTempEditedCopy(p => ({ ...p, call_to_action: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button onClick={handleSaveEditedCopy}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
        </div>
      </>
    );
  }

  // Main products grid view
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Campaign Launch Center</h1>
          <p className="text-lg text-slate-600">Select a product to launch marketing campaigns across multiple platforms</p>
        </div>

        {/* Connection Status */}
        <Card className="rounded-xl bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Let's Get Your Accounts Connected!</h3>
                <p className="text-blue-800 text-sm mb-4">To launch your first campaign, simply connect your ad accounts below. If you're new to advertising, we've provided sign-up links to get you started.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card className="rounded-xl shadow-md border-0 bg-white">
          <CardHeader>
            <CardTitle>Connect Your Ad Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* TikTok */}
              <div className="bg-black rounded-lg p-6 text-center text-white flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">TikTok</h3>
                  {connectedAccounts.tiktok ? (
                    isTokenValid(connectedAccounts.tiktok) ? (
                      <Badge className="bg-green-100 text-green-800 mb-4">Connected</Badge>
                    ) : (
                      <Badge variant="destructive" className="mb-4">Expired</Badge>
                    )
                  ) : (
                     <Badge variant="outline" className="mb-4 border-gray-500 text-gray-400">Not Connected</Badge>
                  )}
                </div>
                <div className="mt-auto">
                  {connectedAccounts.tiktok ? (
                    isTokenValid(connectedAccounts.tiktok) ? (
                      <Button variant="outline" onClick={handleTikTokDisconnect} className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/40 hover:text-white border-red-500/40">
                        <PowerOff className="w-4 h-4 mr-2" /> Disconnect
                      </Button>
                    ) : (
                      <Button onClick={handleTikTokConnect} className="w-full bg-white text-black hover:bg-gray-100">
                        Reconnect
                      </Button>
                    )
                  ) : (
                    <Button onClick={handleTikTokConnect} className="w-full bg-white text-black hover:bg-gray-100">
                      Connect
                    </Button>
                  )}
                  <p className="text-xs mt-2">Need a TikTok Ads account?</p>
                  <a href="https://ads.tiktok.com/" target="_blank" rel="noopener noreferrer" className="underline text-xs p-0 h-auto">
                    Sign up for TikTok Ads →
                  </a>
                </div>
              </div>

              {/* Meta */}
              <div className="bg-blue-600 rounded-lg p-6 text-center text-white flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Meta</h3>
                   {connectedAccounts.facebook ? (
                    isTokenValid(connectedAccounts.facebook) ? (
                      <Badge className="bg-green-100 text-green-800 mb-4">Connected</Badge>
                    ) : (
                      <Badge variant="destructive" className="mb-4">Expired</Badge>
                    )
                  ) : (
                     <Badge variant="outline" className="mb-4 border-blue-300 text-blue-200">Not Connected</Badge>
                  )}
                </div>
                 <div className="mt-auto">
                    {connectedAccounts.facebook ? (
                        isTokenValid(connectedAccounts.facebook) ? (
                        <Button variant="outline" onClick={handleFacebookDisconnect} className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/40 hover:text-white border-red-500/40">
                             <PowerOff className="w-4 h-4 mr-2" /> Disconnect
                        </Button>
                        ) : (
                        <Button onClick={handleFacebookConnect} className="w-full bg-white text-blue-600 hover:bg-gray-100">
                            Reconnect
                        </Button>
                        )
                    ) : (
                        <Button onClick={handleFacebookConnect} className="w-full bg-white text-blue-600 hover:bg-gray-100">
                        Connect
                        </Button>
                    )}
                    <p className="text-xs mt-2 opacity-80">Need a Meta Business account?</p>
                    <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-white underline text-xs p-0 h-auto hover:opacity-80">
                      Sign up for Meta Business →
                    </a>
                </div>
              </div>

              {/* Google */}
              <div className="bg-gray-200 rounded-lg p-6 text-center text-slate-800 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Google Ads</h3>
                  <Badge variant="outline" className="mb-4 border-gray-400 text-gray-500">Coming Soon</Badge>
                </div>
                <div className="mt-auto">
                    <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
                    Connect
                    </Button>
                    <p className="text-xs mt-2 text-slate-500">Need a Google Ads account?</p>
                    <a href="https://ads.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs p-0 h-auto hover:text-blue-800">
                    Sign up for Google Ads →
                    </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="ready">Ready to Launch</SelectItem>
              <SelectItem value="setup_needed">Setup Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="rounded-xl shadow-md hover:shadow-lg transition-all h-full flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="relative mb-4">
                  <img
                    src={product.product_image_url || '/placeholder-image.png'}
                    alt={product.product_name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">Ready</Badge>
                </div>

                <div className="flex-grow">
                  <h3 className="font-semibold text-xl mb-2 text-slate-900 line-clamp-1">
                    {product.product_name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {product.what_is_it}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Get more customers
                    </span>
                    <span className="font-semibold text-lg">${product.price}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>{creativeOutputs.filter(c => c.product_id === product.id).length} creative concepts</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Last updated: {new Date(product.updated_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleLaunchCampaignForProduct(product)}
                  className="w-full mt-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Campaign
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="rounded-xl text-center p-12">
            <CardContent>
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Products Found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm ? `No products match "${searchTerm}".` : "You don't have any products yet."}
              </p>
              <Button onClick={() => navigate(createPageUrl("ProductCreativeSetup"))}>
                <Sparkles className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
