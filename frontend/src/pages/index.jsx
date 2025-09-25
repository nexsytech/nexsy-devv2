import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Login from "./Login";

import Signup from "./Signup";

import Settings from "./Settings";

import BusinessProfile from "./BusinessProfile";

import ForgotPassword from "./ForgotPassword";

import Learning from "./Learning";

import Homepage from "./Homepage";

import BusinessSetup from "./BusinessSetup";

import ProductCreativeSetup from "./ProductCreativeSetup";

import CampaignLauncher from "./CampaignLauncher";

import YourProducts from "./YourProducts";

import ProductDetails from "./ProductDetails";

import TikTokCallback from "./TikTokCallback";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import FacebookCallback from "./FacebookCallback";

import AdVerification from "./AdVerification";

import CampaignStatusTracker from "./CampaignStatusTracker";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    Login: Login,
    
    Signup: Signup,
    
    Settings: Settings,
    
    BusinessProfile: BusinessProfile,
    
    ForgotPassword: ForgotPassword,
    
    Learning: Learning,
    
    Homepage: Homepage,
    
    BusinessSetup: BusinessSetup,
    
    ProductCreativeSetup: ProductCreativeSetup,
    
    CampaignLauncher: CampaignLauncher,
    
    YourProducts: YourProducts,
    
    ProductDetails: ProductDetails,
    
    TikTokCallback: TikTokCallback,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsOfService: TermsOfService,
    
    FacebookCallback: FacebookCallback,
    
    AdVerification: AdVerification,
    
    CampaignStatusTracker: CampaignStatusTracker,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/Signup" element={<Signup />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/BusinessProfile" element={<BusinessProfile />} />
                
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                
                <Route path="/Learning" element={<Learning />} />
                
                <Route path="/Homepage" element={<Homepage />} />
                
                <Route path="/BusinessSetup" element={<BusinessSetup />} />
                
                <Route path="/ProductCreativeSetup" element={<ProductCreativeSetup />} />
                
                <Route path="/CampaignLauncher" element={<CampaignLauncher />} />
                
                <Route path="/YourProducts" element={<YourProducts />} />
                
                <Route path="/ProductDetails" element={<ProductDetails />} />
                
                <Route path="/TikTokCallback" element={<TikTokCallback />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/FacebookCallback" element={<FacebookCallback />} />
                
                <Route path="/AdVerification" element={<AdVerification />} />
                
                <Route path="/CampaignStatusTracker" element={<CampaignStatusTracker />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}