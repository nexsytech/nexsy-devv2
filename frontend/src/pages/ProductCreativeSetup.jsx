
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SimplifiedProduct } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { ArrowLeft, Wand2, Sparkles, UploadCloud, Trash2, Upload, Plus } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { autofillProductDetails } from "@/api/functions";
import { generateMarketingStrategy } from "@/api/functions";
import { generateAdCopies } from "@/api/functions";
import { enhanceProductAnalysis } from "@/api/functions";
import { VisualLibrary } from "@/api/entities";

export default function ProductCreativeSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [productData, setProductData] = useState({
    product_name: "",
    what_is_it: "",
    price: "",
    currency: "USD",
    target_country: "",
    target_country_code: "",
    main_goal: "get_more_customers",
    product_image_url: "",
    product_link: "",
    product_description: "",
    problem_it_solves: "",
    target_customers: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [loadingText, setLoadingText] = useState("Saving your product...");
  const [editMode, setEditMode] = useState(false);
  const [productId, setProductId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [productVisuals, setProductVisuals] = useState([]); // NEW: State for visual library

  // Comprehensive country data with currency mapping (alphabetical)
  const countries = [
    { name: "Afghanistan", code: "AF", currency: "AFN", symbol: "؋" },
    { name: "Albania", code: "AL", currency: "ALL", symbol: "L" },
    { name: "Algeria", code: "DZ", currency: "DZD", symbol: "د.ج" },
    { name: "Andorra", code: "AD", currency: "EUR", symbol: "€" },
    { name: "Angola", code: "AO", currency: "AOA", symbol: "Kz" },
    { name: "Argentina", code: "AR", currency: "ARS", symbol: "$" },
    { name: "Armenia", code: "AM", currency: "AMD", symbol: "֏" },
    { name: "Australia", code: "AU", currency: "AUD", symbol: "$" },
    { name: "Austria", code: "AT", currency: "EUR", symbol: "€" },
    { name: "Azerbaijan", code: "AZ", currency: "AZN", symbol: "₼" },
    { name: "Bahamas", code: "BS", currency: "BSD", symbol: "$" },
    { name: "Bahrain", code: "BH", currency: "BHD", symbol: ".د.ب" },
    { name: "Bangladesh", code: "BD", currency: "BDT", symbol: "৳" },
    { name: "Barbados", code: "BB", currency: "BBD", symbol: "$" },
    { name: "Belarus", code: "BY", currency: "BYN", symbol: "Br" },
    { name: "Belgium", code: "BE", currency: "EUR", symbol: "€" },
    { name: "Belize", code: "BZ", currency: "BZD", symbol: "$" },
    { name: "Benin", code: "BJ", currency: "XOF", symbol: "Fr" },
    { name: "Bhutan", code: "BT", currency: "BTN", symbol: "Nu." },
    { name: "Bolivia", code: "BO", currency: "BOB", symbol: "Bs." },
    { name: "Bosnia and Herzegovina", code: "BA", currency: "BAM", symbol: "KM" },
    { name: "Botswana", code: "BW", currency: "BWP", symbol: "P" },
    { name: "Brazil", code: "BR", currency: "BRL", symbol: "R$" },
    { name: "Brunei", code: "BN", currency: "BND", symbol: "$" },
    { name: "Bulgaria", code: "BG", currency: "BGN", symbol: "лв" },
    { name: "Burkina Faso", code: "BF", currency: "XOF", symbol: "Fr" },
    { name: "Burundi", code: "BI", currency: "BIF", symbol: "FBu" },
    { name: "Cambodia", code: "KH", currency: "KHR", symbol: "៛" },
    { name: "Cameroon", code: "CM", currency: "XAF", symbol: "FCFA" },
    { name: "Canada", code: "CA", currency: "CAD", symbol: "$" },
    { name: "Chile", code: "CL", currency: "CLP", symbol: "$" },
    { name: "China", code: "CN", currency: "CNY", symbol: "¥" },
    { name: "Colombia", code: "CO", currency: "COP", symbol: "$" },
    { name: "Costa Rica", code: "CR", currency: "CRC", symbol: "₡" },
    { name: "Croatia", code: "HR", currency: "EUR", symbol: "€" },
    { name: "Cuba", code: "CU", currency: "CUP", symbol: "$" },
    { name: "Cyprus", code: "CY", currency: "EUR", symbol: "€" },
    { name: "Czech Republic", code: "CZ", currency: "CZK", symbol: "Kč" },
    { name: "Denmark", code: "DK", currency: "DKK", symbol: "kr" },
    { name: "Dominican Republic", code: "DO", currency: "DOP", symbol: "$" },
    { name: "Ecuador", code: "EC", currency: "USD", symbol: "$" },
    { name: "Egypt", code: "EG", currency: "EGP", symbol: "ج.م" },
    { name: "Estonia", code: "EE", currency: "EUR", symbol: "€" },
    { name: "Ethiopia", code: "ET", currency: "ETB", symbol: "Br" },
    { name: "Finland", code: "FI", currency: "EUR", symbol: "€" },
    { name: "France", code: "FR", currency: "EUR", symbol: "€" },
    { name: "Germany", code: "DE", currency: "EUR", symbol: "€" },
    { name: "Ghana", code: "GH", currency: "GHS", symbol: "₵" },
    { name: "Greece", code: "GR", currency: "EUR", symbol: "€" },
    { name: "Guatemala", code: "GT", currency: "GTQ", symbol: "Q" },
    { name: "Honduras", code: "HN", currency: "HNL", symbol: "L" },
    { name: "Hong Kong", code: "HK", currency: "HKD", symbol: "$" },
    { name: "Hungary", code: "HU", currency: "HUF", symbol: "Ft" },
    { name: "Iceland", code: "IS", currency: "ISK", symbol: "kr" },
    { name: "India", code: "IN", currency: "INR", symbol: "₹" },
    { name: "Indonesia", code: "ID", currency: "IDR", symbol: "Rp" },
    { name: "Iran", code: "IR", currency: "IRR", symbol: "﷼" },
    { name: "Iraq", code: "IQ", currency: "IQD", symbol: "ع.د" },
    { name: "Ireland", code: "IE", currency: "EUR", symbol: "€" },
    { name: "Israel", code: "IL", currency: "ILS", symbol: "₪" },
    { name: "Italy", code: "IT", currency: "EUR", symbol: "€" },
    { name: "Jamaica", code: "JM", currency: "JMD", symbol: "$" },
    { name: "Japan", code: "JP", currency: "JPY", symbol: "¥" },
    { name: "Jordan", code: "JO", currency: "JOD", symbol: "د.ا" },
    { name: "Kazakhstan", code: "KZ", currency: "KZT", symbol: "₸" },
    { name: "Kenya", code: "KE", currency: "KES", symbol: "Sh" },
    { name: "Kuwait", code: "KW", currency: "KWD", symbol: "د.ك" },
    { name: "Latvia", code: "LV", currency: "EUR", symbol: "€" },
    { name: "Lebanon", code: "LB", currency: "LBP", symbol: "ل.ل" },
    { name: "Lithuania", code: "LT", currency: "EUR", symbol: "€" },
    { name: "Luxembourg", code: "LU", currency: "EUR", symbol: "€" },
    { name: "Malaysia", code: "MY", currency: "MYR", symbol: "RM" },
    { name: "Malta", code: "MT", currency: "EUR", symbol: "€" },
    { name: "Mexico", code: "MX", currency: "MXN", symbol: "$" },
    { name: "Morocco", code: "MA", currency: "MAD", symbol: "د.م." },
    { name: "Netherlands", code: "NL", currency: "EUR", symbol: "€" },
    { name: "New Zealand", code: "NZ", currency: "NZD", symbol: "$" },
    { name: "Nigeria", code: "NG", currency: "NGN", symbol: "₦" },
    { name: "Norway", code: "NO", currency: "NOK", symbol: "kr" },
    { name: "Pakistan", code: "PK", currency: "PKR", symbol: "₨" },
    { name: "Panama", code: "PA", currency: "PAB", symbol: "B/." },
    { name: "Peru", code: "PE", currency: "PEN", symbol: "S/." },
    { name: "Philippines", code: "PH", currency: "PHP", symbol: "₱" },
    { name: "Poland", code: "PL", currency: "PLN", symbol: "zł" },
    { name: "Portugal", code: "PT", currency: "EUR", symbol: "€" },
    { name: "Qatar", code: "QA", currency: "QAR", symbol: "ر.ق" },
    { name: "Romania", code: "RO", currency: "RON", symbol: "lei" },
    { name: "Russia", code: "RU", currency: "RUB", symbol: "₽" },
    { name: "Saudi Arabia", code: "SA", currency: "SAR", symbol: "ر.س" },
    { name: "Singapore", code: "SG", currency: "SGD", symbol: "$" },
    { name: "Slovakia", code: "SK", currency: "EUR", symbol: "€" },
    { name: "Slovenia", code: "SI", currency: "EUR", symbol: "€" },
    { name: "South Africa", code: "ZA", currency: "ZAR", symbol: "R" },
    { name: "South Korea", code: "KR", currency: "KRW", symbol: "₩" },
    { name: "Spain", code: "ES", currency: "EUR", symbol: "€" },
    { name: "Sri Lanka", code: "LK", currency: "LKR", symbol: "Rs" },
    { name: "Sweden", code: "SE", currency: "SEK", symbol: "kr" },
    { name: "Switzerland", code: "CH", currency: "CHF", symbol: "Fr" },
    { name: "Taiwan", code: "TW", currency: "TWD", symbol: "$" },
    { name: "Thailand", code: "TH", currency: "THB", symbol: "฿" },
    { name: "Turkey", code: "TR", currency: "TRY", symbol: "₺" },
    { name: "Ukraine", code: "UA", currency: "UAH", symbol: "₴" },
    { name: "United Arab Emirates", code: "AE", currency: "AED", symbol: "د.إ" },
    { name: "United Kingdom", code: "GB", currency: "GBP", symbol: "£" },
    { name: "United States", code: "US", currency: "USD", symbol: "$" },
    { name: "Uruguay", code: "UY", currency: "UYU", symbol: "$" },
    { name: "Venezuela", code: "VE", currency: "VES", symbol: "Bs.S" }
  ];

  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountry = countries.find(c => c.code === productData.target_country_code);
  const currencySymbol = selectedCountry?.symbol || "$";

  const mainGoalOptions = [
    { value: "get_more_customers", label: "Get More Customers" },
    { value: "sell_more_products", label: "Sell More Products" },
    { value: "build_awareness", label: "Build Awareness" }
  ];

  // NEW: Function to load product visuals, memoized with useCallback
  const loadProductVisuals = useCallback(async (productIdToLoad) => {
    try {
      const visuals = await VisualLibrary.filter({ product_id: productIdToLoad }, '-created_date');
      setProductVisuals(visuals || []);
    } catch (error) {
      console.error("Error loading product visuals:", error);
    }
  }, [setProductVisuals]); // Dependency array for useCallback

  const fetchProductForEdit = useCallback(async (id) => {
    setIsGenerating(true);
    setLoadingText("Loading product data...");
    try {
      const currentUser = await User.me();
      const products = await SimplifiedProduct.filter({
        created_by: currentUser.email
      });

      console.log("ProductCreativeSetup: Looking for product with ID:", id);
      console.log("ProductCreativeSetup: Products returned by filter:", products);
      const product = products.find(p => p.id === id);
      console.log("ProductCreativeSetup: Result of find operation:", product);

      if (!product) {
        toast.error(`Product with ID ${id} not found. It may have been deleted.`);
        navigate(createPageUrl("YourProducts"));
        return;
      }

      setProductData({
        product_name: product.product_name || "",
        what_is_it: product.what_is_it || "",
        price: product.price !== undefined && product.price !== null ? String(product.price) : "",
        currency: product.currency || "USD",
        target_country: product.target_country || "",
        target_country_code: product.target_country_code || "",
        main_goal: product.main_goal || "get_more_customers",
        product_image_url: product.product_image_url || "",
        product_link: product.product_link || "",
        product_description: product.product_description || "",
        problem_it_solves: product.problem_it_solves || "",
        target_customers: product.target_customers || ""
      });

      if (product.target_country) {
        setCountrySearch(product.target_country);
      }

      // NEW: Load existing visuals for this product
      await loadProductVisuals(id);

    } catch (error) {
      console.error("Error loading product for edit:", error);
      toast.error("Failed to load product for editing.");
      navigate(createPageUrl("YourProducts"));
    } finally {
      setIsGenerating(false);
    }
  }, [navigate, loadProductVisuals, setProductData, setCountrySearch, setIsGenerating, setLoadingText]); // Added state setters to useCallback dependencies

  useEffect(() => {
    console.log("[ProductCreativeSetup Page] Page loaded with URL search params:", location.search);
    const fetchUserAndProduct = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const params = new URLSearchParams(location.search);
            const idToEdit = params.get('edit');
            if (idToEdit) {
                setEditMode(true);
                setProductId(idToEdit);
                await fetchProductForEdit(idToEdit);
            }
        } catch (e) {
            navigate(createPageUrl('Landing'));
        }
    };
    fetchUserAndProduct();
  }, [location.search, navigate, fetchProductForEdit, setUser, setEditMode, setProductId]); // Added state setters to useEffect dependencies

  // Handle country selection
  const handleCountrySelect = (country) => {
    setProductData(prev => ({
      ...prev,
      target_country: country.name,
      target_country_code: country.code,
      currency: country.currency
    }));
    setCountrySearch(country.name);
    setIsCountryDropdownOpen(false);
  };

  const handleAutofill = async () => {
    // Get current form values to ensure we use the latest user input
    const currentProductData = productData;

    if (!currentProductData.product_name || !currentProductData.what_is_it || !currentProductData.price || !currentProductData.main_goal || !currentProductData.target_country) {
        toast.error("Please fill out all fields in the 'Basic Info' section first, including target country.");
        return;
    }
    
    setIsAutofilling(true);
    try {
        const selectedCountry = countries.find(c => c.name === currentProductData.target_country);
        const currentCurrencySymbol = selectedCountry?.symbol || "$";
        
        const instructions = `You are an expert digital marketer specializing in lead generation for small businesses. Always respond in English regardless of the target country.`
        const prompt = `Generate marketing content IN ENGLISH for customers in ${currentProductData.target_country}. 

Product Details:
- Product Name: ${currentProductData.product_name}
- Description: ${currentProductData.what_is_it}
- Price: ${currentCurrencySymbol}${currentProductData.price}
- Target Country: ${currentProductData.target_country}

IMPORTANT: Write all content in English, but tailor it for the ${currentProductData.target_country} market. All fields must be filled with meaningful, non-empty content.

For example, for a product named "GlowUp Face Serum", you might return:
{
  "product_description": "Achieve a radiant, youthful glow with GlowUp Face Serum. Our unique blend of hyaluronic acid and vitamin C deeply hydrates, reduces fine lines, and evens out skin tone, giving you visibly brighter skin in just two weeks. Perfect for the busy urbanite in ${currentProductData.target_country}.",
  "problem_it_solves": "Dull, tired-looking skin caused by stress and environmental factors.",
  "ideal_customers": "Women and men aged 25-45 in ${currentProductData.target_country} who are passionate about clean beauty and want an effective, simple addition to their skincare routine."
}

Now, generate the content for my product.`;

        const schema = {
            type: "object",
            properties: {
                product_description: { type: "string" },
                problem_it_solves: { type: "string" },
                ideal_customers: { type: "string" },
            },
            required: ["product_description", "problem_it_solves", "ideal_customers"],
            additionalProperties: false
        };

        console.log("Autofill: calling backend autofill endpoint");
        const aiData = await autofillProductDetails(
          currentProductData.product_name,
          currentProductData.what_is_it,
          parseFloat(currentProductData.price),
          currentProductData.target_country
        );
        console.log("Autofill: AI data received:", aiData);

        // Enhanced validation with better debugging
        const productDesc = aiData.product_description;
        const problemSolves = aiData.problem_it_solves;
        const idealCustomers = aiData.target_customers || aiData.ideal_customers;

        console.log("Autofill: Field validation:", {
            productDesc: productDesc ? "✓ Has content" : "✗ Empty or missing",
            problemSolves: problemSolves ? "✓ Has content" : "✗ Empty or missing", 
            idealCustomers: idealCustomers ? "✓ Has content" : "✗ Empty or missing"
        });

        // Better debugging - convert object to string for logging
        console.log("Autofill: Raw response details:", {
            aiData: JSON.stringify(aiData, null, 2),
            productDesc_length: productDesc ? productDesc.length : 0,
            problemSolves_length: problemSolves ? problemSolves.length : 0,
            idealCustomers_length: idealCustomers ? idealCustomers.length : 0
        });

        // Check if any field has valid content
        const hasValidContent = (productDesc && productDesc.trim()) || 
                               (problemSolves && problemSolves.trim()) || 
                               (idealCustomers && idealCustomers.trim());

        if (hasValidContent) {
          setProductData(prev => ({
              ...prev,
              product_description: (productDesc && productDesc.trim()) || prev.product_description,
              problem_it_solves: (problemSolves && problemSolves.trim()) || prev.problem_it_solves,
              target_customers: (idealCustomers && idealCustomers.trim()) || prev.target_customers
          }));
          toast.success("AI has filled in the details for you!");
          console.log("Autofill: Successfully updated fields");
        } else {
          // Better error logging with JSON.stringify
          console.error("All AI fields were empty or contained only whitespace:", {
            raw_response: JSON.stringify(aiData, null, 2),
            productDesc,
            problemSolves,
            idealCustomers
          });
          
          // Fallback: Try to generate simple defaults based on product info
          console.log("Attempting fallback content generation...");
          const fallbackData = {
            product_description: `${currentProductData.product_name} is ${currentProductData.what_is_it.toLowerCase()}. It provides excellent value for customers in ${currentProductData.target_country}.`,
            problem_it_solves: `Helps customers get better results with ${currentProductData.product_name}.`,
            target_customers: `Customers in ${currentProductData.target_country} who are interested in ${currentProductData.product_name}.`
          };
          
          setProductData(prev => ({
              ...prev,
              product_description: fallbackData.product_description,
              problem_it_solves: fallbackData.problem_it_solves,
              target_customers: fallbackData.target_customers
          }));
          
          toast.success("Basic content generated. You can edit and improve it as needed.");
        }
        
    } catch (error) {
        console.error("Autofill failed:", error);
        toast.error(`AI Autofill failed: ${error.message}. Please try again or fill in the details manually.`);
    } finally {
        setIsAutofilling(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProductData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setProductData(prev => ({ ...prev, [id]: value }));
  };

  // UPDATED: Enhanced image upload with validation
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // NEW: Strict image validation
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!supportedImageTypes.includes(file.type)) {
      toast.error("Invalid image format. Please upload JPG, JPEG, or PNG files only.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Image file size cannot exceed 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await UploadFile({ file: file });
      console.log('Upload result:', uploadResult);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      const file_url = uploadResult.data.file_url;
      console.log('Setting product_image_url to:', file_url);
      
      // Update the primary product image URL
      setProductData(prev => ({ ...prev, product_image_url: file_url }));

      // If we're in edit mode, save to Visual Library
      if (editMode && productId) {
        const newVisual = await VisualLibrary.create({
          product_id: productId,
          asset_url: file_url,
          title: `${productData.product_name || 'Product'} - Image`,
          media_type: 'image',
          source_type: 'uploaded',
        });
        setProductVisuals(prev => [newVisual, ...prev]);
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Clear the file input
    }
  };

  // NEW: Video upload handler
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // NEW: Strict video validation
    const supportedVideoTypes = ['video/mp4'];
    if (!supportedVideoTypes.includes(file.type)) {
      toast.error("Invalid video format. Please upload MP4 files only.");
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      toast.error("Video file size cannot exceed 500MB.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await UploadFile({ file: file });
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      const file_url = uploadResult.data.file_url;

      // Save to Visual Library (only works if product exists)
      if (editMode && productId) {
        const newVisual = await VisualLibrary.create({
          product_id: productId,
          asset_url: file_url,
          title: `${productData.product_name || 'Product'} - Video`,
          media_type: 'video',
          source_type: 'uploaded',
        });
        setProductVisuals(prev => [newVisual, ...prev]);
        toast.success("Video uploaded successfully!");
      } else {
        toast.info("Video will be saved after you create the product. Please save your product first.");
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      toast.error("Video upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Clear the file input
    }
  };

  // NEW: Delete visual handler
  const handleDeleteVisual = async (visualId, visualType) => {
    if (!confirm(`Are you sure you want to delete this ${visualType}?`)) return;

    try {
      await VisualLibrary.delete(visualId);
      setProductVisuals(prev => prev.filter(v => v.id !== visualId));
      toast.success(`${visualType === 'image' ? 'Image' : 'Video'} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete visual:", error);
      toast.error("Failed to delete visual.");
    }
  };

  const handleGenerate = async () => {
    console.log('🚀 handleGenerate called - starting validation...');
    console.log('Current productData:', productData);
    
    const requiredFields = [
      "product_name", "what_is_it", "price", "main_goal", "product_image_url",
      "product_description", "problem_it_solves", "target_country"
    ];
    const missingField = requiredFields.find(field => !productData[field] || String(productData[field]).trim() === '');
    if (missingField) {
      console.log('❌ Validation failed - missing field:', missingField);
      toast.error(`Please fill out the '${missingField.replace(/_/g, ' ')}' field.`);
      return;
    }

    console.log('✅ Validation passed - proceeding with generation...');
    
    // Fix missing target_country_code if target_country is set
    let finalProductData = { ...productData };
    if (finalProductData.target_country && !finalProductData.target_country_code) {
      const matchingCountry = countries.find(c => c.name.toLowerCase() === finalProductData.target_country.toLowerCase());
      if (matchingCountry) {
        finalProductData.target_country_code = matchingCountry.code;
        finalProductData.currency = matchingCountry.currency;
        console.log('🔧 Auto-fixed country code:', matchingCountry.code, 'for country:', finalProductData.target_country);
      }
    }
    
    setIsGenerating(true);
    let productIdToUse = productId;

    try {
      // Step 1: Save or Update the product record
      setLoadingText(editMode ? "Updating your product..." : "Saving your product...");
      const productPayload = { ...finalProductData, price: parseFloat(finalProductData.price), created_by: user?.email };
      console.log('💾 Product payload being sent to backend:', productPayload);

      if (editMode) {
        await SimplifiedProduct.update(productIdToUse, productPayload);
      } else {
        const savedProductRecord = await SimplifiedProduct.create(productPayload);
        productIdToUse = savedProductRecord.id;
        setProductId(productIdToUse);
        setEditMode(true); // Switch to edit mode immediately
        
        // IMPORTANT: Load and sync visuals for the newly created product
        await loadProductVisuals(productIdToUse);

        // Sync primary product image to VisualLibrary if it was uploaded before product creation
        if (productPayload.product_image_url) {
          try {
            const existingPrimaryVisuals = await VisualLibrary.filter({
              product_id: productIdToUse,
              asset_url: productPayload.product_image_url,
              media_type: 'image',
              source_type: 'uploaded'
            });

            if (existingPrimaryVisuals.length === 0) {
              await VisualLibrary.create({
                product_id: productIdToUse,
                asset_url: productPayload.product_image_url,
                title: productPayload.product_name || 'Product Image',
                media_type: 'image',
                source_type: 'uploaded',
              });
              // Re-load visuals to include the newly synced primary image
              await loadProductVisuals(productIdToUse); 
            }
          } catch (visualError) {
            console.error("Error syncing primary product image to Visual Library for new product:", visualError);
          }
        }
      }
      toast.success("Product saved successfully! Now generating AI insights...");

      // Step 2: Generate and save high-level AI Summary (backend endpoint)
      console.log('📊 Starting AI enhancement for product:', productIdToUse);
      setLoadingText("Generating high-level marketing summary...");
      try {
        const enhanceResult = await enhanceProductAnalysis(productIdToUse);
        console.log('✅ Enhancement result:', enhanceResult);
        toast.success("Marketing summary generated and saved!");
      } catch (e) {
        console.error('❌ Enhancement failed:', e);
        throw new Error(`Failed to generate AI summary: ${e?.message || 'Unknown error'}`);
      }

      // Step 3: Generate detailed Marketing Strategy
      console.log('🎯 Starting marketing strategy generation for product:', productIdToUse);
      setLoadingText("Generating detailed marketing strategy...");
      const strategyRes = await generateMarketingStrategy(productIdToUse);
      console.log('📈 Strategy result:', strategyRes);
      if (!strategyRes?.success) throw new Error(`Failed to generate marketing strategy: ${strategyRes?.error || 'Unknown error'}`);
      toast.success("Detailed marketing strategy created!");
      
      // Step 4: Generate Ad Copies
      console.log('📝 Starting ad copies generation for product:', productIdToUse);
      setLoadingText("Generating ad copies with AI...");
      const adCopiesRes = await generateAdCopies(productIdToUse);
      console.log('📋 Ad copies result:', adCopiesRes);
      if (!adCopiesRes?.success) throw new Error(`Failed to generate ad copies: ${adCopiesRes?.error || 'Unknown error'}`);
      
      // Final Step: Mark as complete and navigate
      console.log('🏁 Marking product as complete and navigating...');
      await SimplifiedProduct.update(productIdToUse, { setup_completed: true });
      toast.success("Product setup complete! Redirecting to details page.");
      navigate(createPageUrl(`ProductDetails?id=${productIdToUse}`));

    } catch (error) {
      console.error("Error during product setup and generation:", error);
      toast.error(`Setup failed: ${error.message || "An unexpected error occurred."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <LoadingSpinner fullPage={true} text={loadingText} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('YourProducts'))} className="mb-4 rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl">
            <h1 className="text-4xl font-heading font-bold text-slate-900 mb-2">
              {editMode ? "Edit Your Product" : "Tell Us About Your Product"}
            </h1>
            <p className="text-slate-600 text-lg">
              The more I know, the better your marketing will be.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Basic Info (Required)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input id="product_name" value={productData.product_name} onChange={handleInputChange} placeholder="e.g., Organic Face Cream" className="mt-2 rounded-lg shadow-inner"/>
                </div>
                <div>
                  <Label htmlFor="what_is_it">One Sentence Description *</Label>
                  <Input id="what_is_it" value={productData.what_is_it} onChange={handleInputChange} placeholder="e.g., A moisturizing cream for sensitive skin" className="mt-2 rounded-lg shadow-inner"/>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price ({currencySymbol}) *</Label>
                  <Input id="price" type="number" step="0.01" value={productData.price} onChange={handleInputChange} placeholder="29.99" className="mt-2 rounded-lg shadow-inner"/>
                </div>
                <div>
                  <Label htmlFor="target_country">Where are you selling this? *</Label>
                  <div className="relative mt-2">
                    <Input
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setIsCountryDropdownOpen(true);
                      }}
                      onFocus={() => setIsCountryDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsCountryDropdownOpen(false), 200)}
                      placeholder="Search country..."
                      className="rounded-lg shadow-inner"
                    />
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                              onMouseDown={() => handleCountrySelect(country)}
                            >
                              <span className="font-medium">{country.name}</span>
                              <span className="text-gray-500 ml-2">({country.currency})</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No countries found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="main_goal">Main Goal *</Label>
                <Select value={productData.main_goal} onValueChange={(value) => handleSelectChange('main_goal', value)}>
                  <SelectTrigger className="mt-2 rounded-lg shadow-inner"><SelectValue placeholder="Choose your main goal..." /></SelectTrigger>
                  <SelectContent>{mainGoalOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="product_link">Link to your product/website</Label>
                <Input id="product_link" value={productData.product_link} onChange={handleInputChange} placeholder="https://example.com/product" className="mt-2 rounded-lg shadow-inner"/>
              </div>

              <div>
                <Label>Product Media *</Label>
                <div className="mt-2 space-y-4">
                  {/* Primary Image Upload */}
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-electric-indigo transition-colors">
                    {productData.product_image_url ? (
                      <div className="space-y-4">
                        <img src={productData.product_image_url} alt="Product" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                        <p className="text-sm text-slate-600">Perfect! Your primary photo is uploaded.</p>
                        <Button variant="outline" className="rounded-lg" onClick={() => document.getElementById('primary-image-upload').click()} disabled={isUploading}>
                          {isUploading ? <LoadingSpinner size="sm" /> : "Choose Different Primary Photo"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                          <UploadCloud className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium">Upload your primary product photo</p>
                          <p className="text-sm text-slate-500">JPG, JPEG, or PNG. Maximum 10MB.</p>
                        </div>
                        <Button variant="outline" className="rounded-lg" onClick={() => document.getElementById('primary-image-upload').click()} disabled={isUploading}>
                          {isUploading ? <LoadingSpinner size="sm" /> : <><UploadCloud className="w-4 h-4 mr-2" />Choose Primary Photo</>}
                        </Button>
                      </div>
                    )}
                    <input id="primary-image-upload" type="file" accept=".jpg,.jpeg,.png" onChange={handleImageUpload} className="hidden"/>
                  </div>

                  {/* Additional Media Uploads (only show in edit mode) */}
                  {editMode && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium text-slate-700">Additional Media</h4>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('additional-image-upload').click()} 
                            disabled={isUploading}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Image
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('video-upload').click()} 
                            disabled={isUploading}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Video
                          </Button>
                        </div>
                      </div>

                      {/* Visual Gallery */}
                      {productVisuals.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {productVisuals.map((visual) => (
                            <div key={visual.id} className="relative group aspect-square">
                              {visual.media_type === 'image' ? (
                                <img 
                                  src={visual.asset_url} 
                                  alt={visual.title} 
                                  className="w-full h-full object-cover rounded-lg shadow-md"
                                />
                              ) : (
                                <div className="w-full h-full bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                                  <video 
                                    src={visual.asset_url} 
                                    className="w-full h-full object-cover"
                                    poster={visual.preview_image_url} // If you have a preview image for video
                                    controls={false} // Hide default controls for preview
                                    muted // Mute for autoplay in gallery
                                    loop // Loop for short previews
                                    autoPlay // Autoplay for short previews
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 5v10l8-5z"/>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="w-8 h-8 bg-red-600/80 hover:bg-red-600" 
                                  onClick={() => handleDeleteVisual(visual.id, visual.media_type)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <input 
                        id="additional-image-upload" 
                        type="file" 
                        accept=".jpg,.jpeg,.png" 
                        onChange={handleImageUpload} 
                        className="hidden"
                      />
                      <input 
                        id="video-upload" 
                        type="file" 
                        accept=".mp4" 
                        onChange={handleVideoUpload} 
                        className="hidden"
                      />
                    </div>
                  )}

                  {!editMode && (
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                      💡 <strong>Tip:</strong> After creating your product, you'll be able to upload additional images and videos to build a complete media library.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-heading text-2xl">Additional Marketing Details</CardTitle>
                  <CardDescription>Fill this in yourself, or let our AI do the heavy lifting for you.</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={handleAutofill} disabled={isAutofilling} className="rounded-lg">
                        {isAutofilling ? <LoadingSpinner size="sm"/> : <><Sparkles className="w-4 h-4 mr-2"/>Autofill with AI</>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-lime-glow text-slate-900 font-semibold">
                      <p>AI will write a compelling summary, pain point, and audience for you.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="product_description">Full Product Description *</Label>
                <Textarea id="product_description" value={productData.product_description} onChange={handleInputChange} placeholder="Describe your product in detail. What makes it special? What are its key features and benefits?" className="mt-2 h-24 rounded-lg shadow-inner"/>
              </div>

              <div>
                <Label htmlFor="problem_it_solves">Problem It Solves *</Label>
                <Textarea id="problem_it_solves" value={productData.problem_it_solves} onChange={handleInputChange} placeholder="e.g., Helps people with dry, irritated skin feel comfortable and confident by providing deep hydration." className="mt-2 h-20 rounded-lg shadow-inner"/>
              </div>

              <div>
                <Label htmlFor="target_customers">Ideal Customers (optional)</Label>
                <Input id="target_customers" value={productData.target_customers} onChange={handleInputChange} placeholder="e.g., Women aged 25-45 who care about natural skincare" className="mt-2 rounded-lg shadow-inner"/>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={isGenerating || isUploading} className="btn-primary h-14 px-8 text-lg">
              <Wand2 className="w-5 h-5 mr-2" />
              {editMode ? "Update & Regenerate Insights" : "Generate AI Insights"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
