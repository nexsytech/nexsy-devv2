
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SimplifiedProduct } from "@/api/entities";
import { CreativeOutput } from "@/api/entities";
import { VisualLibrary } from "@/api/entities";
import { User } from "@/api/entities";
import { MarketingStrategy } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { invokeOpenAI } from "@/api/functions";
import { generateGptImage1 } from "@/api/functions";
import { ugcVideo } from "@/api/functions";
import { generateAdCopies } from "@/api/functions";
import { generateMarketingStrategy } from "@/api/functions";
import { generateVideoScript } from "@/api/functions"; // NEW

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  Users,
  BrainCircuit,
  ChevronDown,
  Bot,
  Sparkles,
  Edit,
  Trash2,
  Upload,
  Target,
  FileText,
  KeyRound,
  Rocket,
  ChevronLeft,
  Wand2,
  X,
  PlayCircle,
  Image as ImageIcon,
  Video,
  Loader2,
  Briefcase,
  Lightbulb,
  Paintbrush,
  Copy
} from "lucide-react";
import SelectAdCopyModal from "../components/product/SelectAdCopyModal";
import VideoGenerationModal from "../components/product/VideoGenerationModal"; // NEW

const marketingTones = [
  { value: "friendly", label: "Friendly & Approachable" },
  { value: "professional", label: "Professional & Trustworthy" },
  { value: "fun", label: "Fun & Playful" },
  { value: "urgent", label: "Urgent & Action-Oriented" },
  { value: "luxury", label: "Luxury & Exclusive" }
];

export default function ProductDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [creativeOutput, setCreativeOutput] = useState(null); // This holds the *latest* creative output. Used for determining if the setup is complete.
  const [allProductCreativeOutputs, setAllProductCreativeOutputs] = useState([]); // This holds ALL creative outputs for the product.
  const [marketingStrategy, setMarketingStrategy] = useState(null); // New state for strategy
  const [isGenerating, setIsGenerating] = useState(false);
  const [visuals, setVisuals] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [displayedCopies, setDisplayedCopies] = useState([]);
  const [editingCopy, setEditingCopy] = useState(null);
  const [selectedTone, setSelectedTone] = useState('');

  const [selectedVisualForModal, setSelectedVisualForModal] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const [showSelectAdCopyModal, setShowSelectAdCopyModal] = useState(false);
  const [showVideoGenerationModal, setShowVideoGenerationModal] = useState(false); // NEW
  const [isGeneratingScript, setIsGeneratingScript] = useState(false); // NEW
  const [generatedScript, setGeneratedScript] = useState(null); // NEW

  // Memoize image and video assets for stable references
  const imageAssets = useMemo(() => visuals.filter(v => v.media_type === 'image'), [visuals]);
  const videoAssets = useMemo(() => visuals.filter(v => v.media_type === 'video'), [visuals]);

  // Helper functions used by loadProductData, hoisted and memoized to ensure stability
  const loadCreativeOutput = useCallback(async (productId) => {
    try {
      const outputs = await CreativeOutput.filter({ product_id: productId }, '-generation_timestamp', 1);
      if (outputs && outputs.length > 0) {
        setCreativeOutput(outputs[0]);
        return outputs[0];
      }
      setCreativeOutput(null);
      return null;
    } catch (error) {
      console.error("Error loading creative outputs:", error);
      return null;
    }
  }, [setCreativeOutput]);

  const loadAllCreativeOutputs = useCallback(async (productId) => {
    try {
      const outputs = await CreativeOutput.filter({ product_id: productId }, '-generation_timestamp');
      setAllProductCreativeOutputs(outputs || []);

      // Aggregate all ad copies from all creative outputs
      const allAdCopies = [];
      if (outputs && outputs.length > 0) {
        outputs.forEach((output, outputIndex) => {
          if (output.ad_copies && Array.isArray(output.ad_copies)) {
            output.ad_copies.forEach((copy, copyIndex) => {
              allAdCopies.push({
                ...copy,
                // Add metadata to track which creative output this copy belongs to
                _creative_output_id: output.id,
                _output_index: outputIndex,
                _copy_index: copyIndex,
                _generation_date: output.generation_timestamp || output.created_date,
                _tone_label: output.creative_concept_title || `Generation ${outputs.length - outputIndex}`
              });
            });
          }
        });
      }

      // Sort by generation date (newest first) to show most recent copies at the top
      allAdCopies.sort((a, b) => new Date(b._generation_date) - new Date(a._generation_date));
      setDisplayedCopies(allAdCopies);

    } catch (error) {
      console.error("Error loading all creative outputs:", error);
    }
  }, [setAllProductCreativeOutputs, setDisplayedCopies]);

  const loadMarketingStrategy = useCallback(async (productId) => {
    try {
      const strategies = await MarketingStrategy.filter({ product_id: productId }, '-created_date', 1);
      if (strategies && strategies.length > 0) {
        setMarketingStrategy(strategies[0]);
      } else {
        setMarketingStrategy(null);
      }
    } catch (error) {
      console.error("Error loading marketing strategy:", error);
      setMarketingStrategy(null); // Ensure it's null on error
    }
  }, [setMarketingStrategy]);

  const loadVisuals = useCallback(async (productId) => {
    try {
      let visualData = await VisualLibrary.filter({ product_id: productId }, '-created_date');
      setVisuals(visualData || []);
    } catch (error) {
      console.error("Error loading visuals:", error);
    }
  }, [setVisuals]);

  // handleGenerateInitialInsights is used by loadProductData
  const handleGenerateInitialInsights = useCallback(async (currentProduct) => {
    setLoading(true);
    try {
      const prompt = `
        You are preparing a creative brief for a performance ad campaign.
        Create:
        1) creative_concept_title – short, sticky theme.
        2) creative_concept_description – 3–5 sentences max. Concrete, benefit-first.
        3) target_audience_summary – 3–6 bullet lines (one sentence each).
        4) why_this_works – A bulleted list of 3-5 specific persuasion reasons (no jargon). Each bullet point must be on a new line.
        5) ad_copies – 3 variants for "universal" platform.
        Product Name: ${currentProduct.product_name}
        Description: ${currentProduct.product_description}
      `;
      const schema = {
        type: "object",
        properties: {
          creative_concept_title: { type: "string" },
          creative_concept_description: { type: "string" },
          target_audience_summary: { type: "string" },
          why_this_works: { type: "string" },
          ad_copies: { type: "array", items: { type: "object", properties: { variation_name: { type: "string" }, headline: { type: "string" }, body_text: { type: "string" }, call_to_action: { type: "string" }, platform_optimized: { type: "string" } } } }
        },
        required: ["creative_concept_title", "creative_concept_description", "target_audience_summary", "why_this_works", "ad_copies"]
      };
      const { data: aiResponse, error } = await invokeOpenAI({ prompt, response_json_schema: schema });
      if (error || !aiResponse) throw new Error("Failed to generate initial AI insights.");

      const newCreativeOutput = await CreativeOutput.create({ product_id: currentProduct.id, ...aiResponse, generation_timestamp: new Date().toISOString() });
      await SimplifiedProduct.update(currentProduct.id, { setup_completed: true, ai_analysis_summary: aiResponse.creative_concept_description, ai_target_audience_profile: aiResponse.target_audience_summary, ai_key_selling_points: aiResponse.why_this_works.split('\n') });

      setProduct(prev => ({ ...prev, setup_completed: true, ai_analysis_summary: aiResponse.creative_concept_description, ai_target_audience_profile: aiResponse.target_audience_summary, ai_key_selling_points: aiResponse.why_this_works.split('\n') }));
      setCreativeOutput(newCreativeOutput);
      setAllProductCreativeOutputs(prev => [newCreativeOutput, ...prev]);
      await loadAllCreativeOutputs(currentProduct.id);
      toast.success("Initial AI insights and creative setup generated!");
    } catch (error) {
      console.error("Error generating initial AI insights:", error);
      toast.error("Failed to generate initial AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProduct, setCreativeOutput, setAllProductCreativeOutputs, loadAllCreativeOutputs]);

  const loadProductData = useCallback(async (id) => {
    try {
      const currentUser = await User.me();
      if (!currentUser || !currentUser.email) {
        toast.error("User not authenticated.");
        navigate(createPageUrl("YourProducts"));
        return;
      }
      const allProducts = await SimplifiedProduct.filter({ created_by: currentUser.email });
      const data = allProducts.find(p => p.id === id);

      if (!data) {
        toast.error("Product not found.");
        navigate(createPageUrl("YourProducts"));
        return;
      }
      setProduct(data);

      await loadCreativeOutput(id);
      await loadAllCreativeOutputs(id);
      await loadVisuals(id);
      await loadMarketingStrategy(id); // New function call to load strategy

      if (!data.setup_completed) {
        const outputs = await CreativeOutput.filter({ product_id: id }, '-generation_timestamp', 1);
        if (!outputs || outputs.length === 0) {
          await handleGenerateInitialInsights(data);
        } else {
          await SimplifiedProduct.update(id, { setup_completed: true });
          setProduct(prev => ({ ...prev, setup_completed: true }));
        }
      }

    } catch (error) {
      console.error("Error loading product data:", error);
      toast.error("Failed to load product details. Please try again.");
      navigate(createPageUrl("YourProducts"));
    } finally {
      setLoading(false);
    }
  }, [navigate, setProduct, setLoading, loadCreativeOutput, loadAllCreativeOutputs, loadVisuals, loadMarketingStrategy, handleGenerateInitialInsights]);


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get('id');

    if (id) {
      const fetchData = async () => {
        setLoading(true); // Set loading before starting fetch
        await loadProductData(id);
      };
      fetchData();
    }
  }, [location.search, loadProductData, setLoading]); // Added setLoading to useEffect dependencies

  const handleGenerateNewCopies = async (tone) => {
    if (!product || !product.id) {
      toast.error("Product data is not loaded yet.");
      return;
    }
    setIsGenerating(true);
    try {
      const strategies = await MarketingStrategy.filter({ product_id: product.id });

      // If no strategy exists, OR if the existing strategy is old and lacks a CoT ID, regenerate it.
      if (strategies.length === 0 || (strategies.length > 0 && !strategies[0].openai_response_id)) {
        toast.info("Updating marketing strategy to the latest version...");
        const { data: strategyResult, error: strategyError } = await generateMarketingStrategy({ product_id: product.id });
        if (strategyError || !strategyResult.success) {
          throw new Error(strategyError?.message || strategyResult?.error || "Failed to generate the required marketing strategy. Please try again.");
        }
        await loadMarketingStrategy(product.id); // Reload new strategy
        toast.success("Strategy updated! Now generating ad copies.");
      }

      const { data: result, error } = await generateAdCopies({
        product_id: product.id,
        tone: tone,
      });

      if (error || !result.success || !result.creative_output) {
        throw new Error(error?.message || result.error || "AI did not return valid ad copies or creative output.");
      }

      // Reload both creative output and all creative outputs to refresh the aggregated display
      await loadCreativeOutput(product.id);
      await loadAllCreativeOutputs(product.id);

      toast.success(`Generated ${result.creative_output.ad_copies.length} new ${tone} ad copies!`);
      setSelectedTone('');
    } catch (err) {
      console.error("Failed to generate new copies:", err);
      toast.error(`Failed to generate new ad copies: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateCreativeOutputCopies = async (creativeOutputId, updatedCopyList) => {
    try {
      const originalOutput = allProductCreativeOutputs.find(o => o.id === creativeOutputId);
      if (!originalOutput) {
        toast.error("Could not find the creative generation to update.");
        return;
      }
      
      const updatedCreativeOutputPayload = {
        ...originalOutput,
        ad_copies: updatedCopyList
      };
      
      // Remove the id from the payload as it shouldn't be in the update body
      delete updatedCreativeOutputPayload.id;

      await CreativeOutput.update(creativeOutputId, updatedCreativeOutputPayload);
      await loadAllCreativeOutputs(product.id);
      toast.success("Ad copy updated successfully!");

    } catch (error) {
      console.error("Failed to update ad copy:", error);
      toast.error("Failed to update ad copy.");
    }
  };


  const handleDeleteCopy = async (creativeOutputId, indexToDelete) => {
    const targetOutput = allProductCreativeOutputs.find(o => o.id === creativeOutputId);
    if (!targetOutput || !targetOutput.ad_copies) return;

    const updatedCopies = targetOutput.ad_copies.filter((_, index) => index !== indexToDelete);

    if (updatedCopies.length === 0) {
      toast.warn("The last copy of a generation cannot be deleted.");
      return;
    }

    await updateCreativeOutputCopies(creativeOutputId, updatedCopies);
  };

  const handleSaveEditedCopy = async (editedCopyState) => {
    const { _creative_output_id: creativeOutputId, originalIndex, ...newCopyData } = editedCopyState;
    
    // Clean up internal properties before saving
    delete newCopyData._copy_index;
    delete newCopyData._generation_date;
    delete newCopyData._output_index;
    delete newCopyData._tone_label;
    
    const targetOutput = allProductCreativeOutputs.find(o => o.id === creativeOutputId);
    if (!targetOutput || !targetOutput.ad_copies) return;

    const updatedCopies = [...targetOutput.ad_copies];
    updatedCopies[originalIndex] = newCopyData;

    await updateCreativeOutputCopies(creativeOutputId, updatedCopies);
    setEditingCopy(null);
  };

  const handleGenerateImageWithSelectedCopy = async (creativeOutputId, copyIndex) => {
    if (!product || !product.id) return;
    setIsGeneratingImage(true);
    setShowSelectAdCopyModal(false);
    try {
      const { data: response, error } = await generateGptImage1({
        product_id: product.id,
        creative_output_id: creativeOutputId,
        copy_index: copyIndex
      });
      if (error || !response || !response.images || response.images.length === 0) throw new Error(error?.message || "No images generated.");

      const base64Data = response.images[0].imageBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'image/png' });
      const file = new File([blob], `ai-generated-${product.product_name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      const { file_url } = await UploadFile({ file });
      await VisualLibrary.create({
        product_id: product.id,
        title: `AI Generated - ${product.product_name}`,
        asset_url: file_url,
        media_type: "image",
        source_type: "gpt_image_1_generated",
        associated_creative_output_id: creativeOutputId, // NEW
        associated_ad_copy_index: copyIndex // NEW
      });

      toast.success("New AI visual generated and saved!");
      await loadVisuals(product.id);
    } catch (error) {
      console.error("Error generating visuals:", error);
      toast.error(`Failed to generate visuals: ${error.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // NEW: handleGenerateScript
  const handleGenerateScript = async (scriptParams) => {
    setIsGeneratingScript(true);
    setGeneratedScript(null); // Clear previous script
    
    try {
      console.log('Generating script with params:', scriptParams);
      const { data: response, error } = await generateVideoScript(scriptParams);
      
      console.log('Script generation response:', { response, error });
      
      if (error) {
        console.error('Script generation error:', error);
        toast.error(`Failed to generate script: ${error.message || 'Unknown error'}`);
        return;
      }
      
      if (!response || !response.success) {
        console.error('Script generation failed:', response);
        toast.error(`Failed to generate script: ${response?.error || 'Unknown error'}`);
        return;
      }
      
      if (!response.script) {
        console.error('No script in response:', response);
        toast.error('Script generation returned invalid data');
        return;
      }
      
      console.log('Script generated successfully:', response.script);
      setGeneratedScript(response); // Store the full response object
      toast.success("Video script generated successfully!");
      
    } catch (error) {
      console.error("Error generating script:", error);
      toast.error(`Failed to generate script: ${error.message || 'Network error'}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // NEW: handleGenerateVideoWithScript (replaces old handleGenerateVideo)
  const handleGenerateVideoWithScript = async (videoParams) => {
    setIsGeneratingVideo(true);
    toast.info("Starting AI video generation... This may take a few minutes.");
    try {
      const { data: videoResult, error: videoError } = await ugcVideo(videoParams);

      if (videoError || !videoResult || !videoResult.video_url) {
        throw new Error(videoError?.message || "Failed to generate video.");
      }

      await VisualLibrary.create({
        title: `${product.product_name} - AI Video`,
        product_id: product.id,
        asset_url: videoResult.video_url,
        media_type: "video",
        source_type: "freepik_generated",
        freepik_prompt: `AI-generated UGC video for ${product.product_name}`,
        preview_image_url: videoParams.image_url,
        associated_creative_output_id: videoParams.creative_output_id, // NEW
        associated_ad_copy_index: videoParams.ad_copy_index, // NEW
        generated_video_script: videoParams.video_script // NEW
      });

      toast.success("Video generated successfully!");
      await loadVisuals(product.id);
      setGeneratedScript(null); // Reset for next use
      setShowVideoGenerationModal(false); // Close modal after generation
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error(`Error generating video: ${error.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await VisualLibrary.create({ product_id: product.id, title: file.name, asset_url: file_url, media_type: 'image', source_type: 'uploaded' });
      toast.success("Image uploaded successfully!");
      await loadVisuals(product.id);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVisual = async (visualId) => {
    const visualToDelete = visuals.find(v => v.id === visualId);
    if (!visualToDelete || !confirm(`Are you sure you want to delete this ${visualToDelete.media_type}?`)) return;

    try {
      await VisualLibrary.delete(visualId);
      toast.success(`${visualToDelete.media_type === 'image' ? 'Image' : 'Video'} deleted successfully.`);
      setVisuals(visuals.filter((v) => v.id !== visualId));
      setSelectedVisualForModal(null);
    } catch (error) {
      console.error("Failed to delete visual:", error);
      toast.error("Could not delete the visual.");
    }
  };

  const handleEditProduct = () => {
    if (product && product.id) navigate(createPageUrl(`ProductCreativeSetup?edit=${product.id}`));
  };

  const handleCopyText = (textToCopy, subject) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success(`${subject} copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy text.");
    });
  };

  const handleLaunchCampaign = () => {
    if (product && product.id) navigate(createPageUrl(`CampaignLauncher?productId=${product.id}`));
  };

  // Helper function to check if an ad copy was used for image generation
  const wasUsedForImageGeneration = useCallback((copy) => {
    return imageAssets.some(image =>
      image.associated_creative_output_id === copy._creative_output_id &&
      image.associated_ad_copy_index === copy._copy_index
    );
  }, [imageAssets]); // Added imageAssets dependency

  // Helper function to check if an ad copy was used for video generation
  const wasUsedForVideoGeneration = useCallback((copy) => {
    return videoAssets.some(video =>
      video.associated_creative_output_id === copy._creative_output_id &&
      video.associated_ad_copy_index === copy._copy_index
    );
  }, [videoAssets]); // Added videoAssets dependency

  if (loading || !product) {
    return <LoadingSpinner fullPage={true} text="Loading AI insights..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(createPageUrl('YourProducts'))} className="rounded-lg">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to All Products
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-lg" onClick={handleEditProduct}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
            <Button onClick={handleLaunchCampaign} className="btn-primary rounded-lg">
              <Rocket className="w-4 h-4 mr-2" />
              Launch This Campaign
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="bg-[#4169E1] p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <img src={product.product_image_url} alt={product.product_name} className="bg-slate-50 w-32 h-32 object-cover rounded-2xl border-4 border-white/20 shadow-lg" />
              <div className="flex-1">
                <h1 className="text-4xl text-slate-50 mb-2 font-extrabold">{product.product_name}</h1>
                <p className="text-slate-300 text-lg max-w-3xl mb-4">{product.what_is_it}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#E0E0E0] shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="font-heading text-2xl">AI Creative Director Insights</CardTitle>
                <CardDescription>Here's what I've learned about your product and how I'd market it.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible className="border border-slate-200 rounded-lg">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-slate-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-base text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Marketing Summary</h4>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 data-[state=open]:rotate-180 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 pt-2">
                <p className="text-[15px] text-[#0F172A] leading-[1.6]" style={{ fontFamily: 'Inter' }}>
                  {product.ai_analysis_summary || "No summary available yet."}
                </p>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible className="border border-slate-200 rounded-lg">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-slate-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-base text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Target Audience Profile</h4>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 data-[state=open]:rotate-180 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 pt-2">
                <p className="text-[15px] text-[#0F172A] leading-[1.6] whitespace-pre-wrap" style={{ fontFamily: 'Inter' }}>
                  {product.ai_target_audience_profile || "No audience profile available yet."}
                </p>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible className="border border-slate-200 rounded-lg">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-slate-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-base text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Key Selling Points</h4>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 data-[state=open]:rotate-180 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 pt-4">
                <div className="space-y-3">
                  {product.ai_key_selling_points && Array.isArray(product.ai_key_selling_points) && product.ai_key_selling_points.length > 0 ?
                    product.ai_key_selling_points
                      .filter(point => typeof point === 'string' && point.trim() !== '')
                      .map((point, index) => {
                        const cleanPoint = point.replace(/^[-\*\s]+/, '').trim(); // Remove leading bullets and trim
                        if (!cleanPoint) return null;
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-5 h-5 flex-shrink-0 mt-1 flex items-center justify-center rounded-full" style={{ backgroundColor: '#C6FF4E' }}>
                              <Check className="w-3 h-3 text-slate-800" />
                            </div>
                            <p className="text-[15px] text-[#0F172A] leading-[1.6]" style={{ fontFamily: 'Inter' }}>
                              {cleanPoint}
                            </p>
                          </div>
                        );
                      })
                      .filter(Boolean) // Remove nulls from the map
                    :
                    <p className="text-[15px] text-slate-500" style={{ fontFamily: 'Inter' }}>No key selling points available yet.</p>
                  }
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* NEW: Marketing Strategy Sections */}
            {marketingStrategy && (
              <>
                {marketingStrategy.product_infopack?.customer_avatars && marketingStrategy.product_infopack.customer_avatars.length > 0 && (
                  <Collapsible className="border border-slate-200 rounded-lg">
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-slate-50 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-base text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Buyer Personas</h4>
                      </div>
                      <ChevronDown className="w-5 h-5 text-slate-400 data-[state=open]:rotate-180 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-6 pt-2">
                      <Accordion type="single" collapsible className="w-full">
                        {marketingStrategy.product_infopack.customer_avatars.map((avatar, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{avatar.label || `Persona ${index + 1}`}</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-[15px] text-[#0F172A] leading-[1.6] whitespace-pre-wrap">{avatar.description || "No description available."}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {marketingStrategy.creative_brief && (
                  <>
                    <Collapsible className="border border-slate-200 rounded-lg">
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-slate-50 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-base text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Creative Angle</h4>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-400 data-[state=open]:rotate-180 transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-6 pt-2">
                        <p className="text-[15px] text-[#0F172A] leading-[1.6]">{marketingStrategy.creative_brief.creative_angle}</p>
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible className="border border-slate-200 rounded-lg">
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-slate-50 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <Paintbrush className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-base text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Visual Design Direction</h4>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-400 data-[state=open]:rotate-180 transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-6 pt-2">
                        <p className="text-[15px] text-[#0F172A] leading-[1.6]">{marketingStrategy.creative_brief.visual_style_art_direction}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </>
            )}

          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 p-6 pb-0">
            <div>
              <h2 className="text-3xl font-heading font-bold">Your Marketing Copy</h2>
              <p className="text-slate-600">AI-generated ad copies ready to be used in your campaigns. Showing all previous generations.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="min-w-[200px]">
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger className="w-full bg-white border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm font-medium hover:border-[#4169E1] focus:border-[#4169E1] transition-colors">
                    <SelectValue placeholder="Choose tone..." className="font-jakarta" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#E0E0E0] rounded-lg">
                    {marketingTones.map((tone) =>
                      <SelectItem key={tone.value} value={tone.value} className="px-3 py-2 hover:bg-[#C6FF4E] focus:bg-[#C6FF4E] font-jakarta">
                        {tone.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="bg-[#C6FF4E] text-slate-900 hover:bg-[#C6FF4E]/90 rounded-lg px-4 py-2 font-jakarta"
                disabled={isGenerating || !selectedTone}
                onClick={() => selectedTone && handleGenerateNewCopies(selectedTone)}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate New Ideas"}
              </Button>
            </div>
          </div>

          {isGenerating && <LoadingSpinner text="Generating new ad copies..." />}

          {displayedCopies.length > 0 ?
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 pt-0">
              {displayedCopies.map((copy, index) =>
                <Card key={`${copy._creative_output_id}-${copy._copy_index}-${index}`} className="flex flex-col rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-6 flex-grow flex flex-col space-y-4 h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-800 mb-2">{copy.headline}</h4>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="ml-0 text-xs bg-slate-50 text-slate-600">
                            {copy._tone_label}
                          </Badge>
                          {/* NEW: Show usage badges */}
                          {wasUsedForImageGeneration(copy) && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Used for Image
                            </Badge>
                          )}
                          {wasUsedForVideoGeneration(copy) && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              <Video className="w-3 h-3 mr-1" />
                              Used for Video
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => handleCopyText(copy.headline, 'Headline')} className="text-slate-400 hover:text-slate-600">
                          <Copy className="w-4 h-4" />
                        </button>
                        {/* Make edit and delete available for all copies */}
                        <button
                          onClick={() => setEditingCopy({ ...copy, originalIndex: copy._copy_index })}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCopy(copy._creative_output_id, copy._copy_index)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <p className="text-slate-600 whitespace-pre-wrap">{copy.body_text}</p>
                    </div>

                    {/* Bottom section with consistent spacing */}
                    <div className="mt-auto space-y-4">
                      {copy.offer_value_proposition && (
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-indigo-800 flex-1 pr-2">✨ Offer: {copy.offer_value_proposition}</p>
                            <button onClick={() => handleCopyText(copy.offer_value_proposition, 'Offer')} className="text-indigo-400 hover:text-indigo-600">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-200/80">
                        <div className="flex justify-between items-center">
                          <Badge variant="default" className="bg-[#4169E1] text-white font-semibold">{copy.call_to_action}</Badge>
                          <button onClick={() => handleCopyText(copy.call_to_action, 'Call to Action')} className="text-slate-400 hover:text-slate-600">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div> :
            !isGenerating && <p className="text-slate-500 p-6">No ad copies generated yet. Choose a tone and click Generate New Ideas to create some!</p>
          }

        {/* Restore editing modal */}
        {editingCopy && (
          <Dialog open={!!editingCopy} onOpenChange={() => setEditingCopy(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Ad Copy</DialogTitle>
                <DialogDescription>Modify your ad copy details below.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-headline">Headline</Label>
                  <Input
                    id="edit-headline"
                    value={editingCopy.headline}
                    onChange={(e) => setEditingCopy({ ...editingCopy, headline: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-body">Body Text</Label>
                  <Textarea
                    id="edit-body"
                    value={editingCopy.body_text}
                    onChange={(e) => setEditingCopy({ ...editingCopy, body_text: e.target.value })}
                    rows={4}
                  />
                </div>

                {editingCopy.offer_value_proposition !== undefined && (
                  <div>
                    <Label htmlFor="edit-offer">Offer/Value Proposition</Label>
                    <Input
                      id="edit-offer"
                      value={editingCopy.offer_value_proposition || ''}
                      onChange={(e) => setEditingCopy({ ...editingCopy, offer_value_proposition: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="edit-cta">Call to Action</Label>
                  <Input
                    id="edit-cta"
                    value={editingCopy.call_to_action}
                    onChange={(e) => setEditingCopy({ ...editingCopy, call_to_action: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingCopy(null)}>Cancel</Button>
                <Button onClick={() => handleSaveEditedCopy(editingCopy)}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-heading text-2xl flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                  Image Creatives
                </CardTitle>
                <CardDescription>Generate and manage static images for your ad campaigns.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => document.getElementById('image-upload').click()} disabled={isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                <input type="file" id="image-upload" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <Button className="bg-[#C6FF4E] text-slate-800 hover:bg-[#C6FF4E]/90 rounded-lg" onClick={() => setShowSelectAdCopyModal(true)} disabled={isGeneratingImage || !creativeOutput || displayedCopies.length === 0}>
                  {isGeneratingImage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate AI Image</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isGeneratingImage && (
                <div className="text-center py-12"><div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /><div className="space-y-2"><h3 className="text-lg font-semibold text-slate-900">Creating your ad-ready image</h3><p className="text-slate-600">Our AI is transforming your product into a professional marketing visual...</p></div></div></div>
              )}
              {!isGeneratingImage && imageAssets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {imageAssets.map((visual) => (
                    <div key={visual.id} className="relative group aspect-square">
                      <img src={visual.asset_url} alt={visual.title || "Product Image"} className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer" onClick={() => setSelectedVisualForModal(visual)} />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="icon" className="w-8 h-8 bg-black/50 hover:bg-red-600/80" onClick={() => handleDeleteVisual(visual.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isGeneratingImage && (
                <div className="text-center py-12 text-slate-500"><ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p>No images found. Upload or generate images to get started.</p></div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Video className="w-6 h-6 text-indigo-600" /></div><div><h3 className="text-xl font-heading font-bold text-slate-800">Video Creatives</h3><p className="text-sm text-slate-500">Generate AI-powered UGC videos from your ad copies and images.</p></div></div>
                <Button
                  onClick={() => setShowVideoGenerationModal(true)}
                  disabled={isGeneratingVideo || displayedCopies.length === 0 || imageAssets.length === 0}
                  className="btn-primary"
                >
                  {isGeneratingVideo ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate AI Video Ad</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {displayedCopies.length === 0 && (
                <div className="text-center py-4 px-6 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-800">Please generate some ad copies first before creating videos.</p></div>
              )}
              {imageAssets.length === 0 && displayedCopies.length > 0 && (
                <div className="text-center py-4 px-6 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-800">Please upload or generate images first before creating videos.</p></div>
              )}
              {isGeneratingVideo && (
                <div className="text-center py-12"><div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /><div className="space-y-2"><h3 className="text-lg font-semibold text-slate-900">Creating your video ad</h3><p className="text-slate-600">This usually takes 2-3 minutes...</p></div></div></div>
              )}
              {!isGeneratingVideo && videoAssets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videoAssets.map((visual) => (
                    <div key={visual.id} className="relative group aspect-[9/16]">
                      <div className="relative w-full h-full object-cover rounded-lg shadow-md bg-black flex items-center justify-center cursor-pointer" onClick={() => setSelectedVisualForModal(visual)}>
                        <video src={visual.asset_url} controls={false} poster={visual.preview_image_url || (product?.product_image_url || undefined)} className="w-full h-full object-contain rounded-lg" preload="metadata" />
                        <PlayCircle className="absolute w-12 h-12 text-white/80 group-hover:text-white transition-colors" />

                        {/* Enhanced source indicator badge */}
                        <div className="absolute top-2 left-2 space-y-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium ${
                              visual.source_type === 'uploaded'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {visual.source_type === 'uploaded' ? 'Uploaded' : 'AI Generated'}
                          </Badge>
                          {/* Show script-based badge for Freepik generated videos */}
                          {visual.source_type === 'freepik_generated' && visual.generated_video_script && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Script-Based
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="icon" className="w-8 h-8 bg-black/50 hover:bg-red-600/80" onClick={() => handleDeleteVisual(visual.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isGeneratingVideo && displayedCopies.length > 0 && imageAssets.length > 0 && videoAssets.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p>No videos generated yet. Click the button above to create your first AI video!</p></div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {selectedVisualForModal && (
          <Dialog open={!!selectedVisualForModal} onOpenChange={() => setSelectedVisualForModal(null)}>
            <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-6">
              <DialogHeader className="pb-4 flex-shrink-0">
                <DialogTitle className="text-xl font-bold">{selectedVisualForModal.title}</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">Source: {selectedVisualForModal.source_type?.replace(/_/g, ' ')}</DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto p-4">
                {selectedVisualForModal.media_type === 'image' ? (
                  <img src={selectedVisualForModal.asset_url} alt={selectedVisualForModal.title} className="max-w-full h-auto object-contain rounded-lg shadow-lg" />
                ) : (
                  <video src={selectedVisualForModal.asset_url} controls poster={selectedVisualForModal.preview_image_url || (product?.product_image_url || undefined)} className="max-w-full h-auto object-contain rounded-lg shadow-lg" />
                )}
              </div>
              <DialogFooter className="mt-6 flex justify-end flex-shrink-0">
                <Button variant="destructive" onClick={() => handleDeleteVisual(selectedVisualForModal.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete Permanently</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <SelectAdCopyModal
          open={showSelectAdCopyModal}
          onClose={() => setShowSelectAdCopyModal(false)}
          creativeOutputs={allProductCreativeOutputs}
          onSelectAdCopy={handleGenerateImageWithSelectedCopy}
          isGenerating={isGeneratingImage}
          productImage={product.product_image_url}
        />

        {/* NEW: Video Generation Modal */}
        <VideoGenerationModal
          open={showVideoGenerationModal}
          onClose={() => {
            setShowVideoGenerationModal(false);
            setGeneratedScript(null); // Clear script when closing modal
          }}
          product={product}
          displayedCopies={displayedCopies}
          imageAssets={imageAssets}
          onGenerateScript={handleGenerateScript}
          onGenerateVideo={handleGenerateVideoWithScript}
          isGeneratingScript={isGeneratingScript}
          isGeneratingVideo={isGeneratingVideo}
          generatedScript={generatedScript}
        />

        <div className="text-center pt-8">
          <Button size="lg" className="btn-primary h-14 px-8 text-lg" onClick={handleLaunchCampaign}>
            <Rocket className="w-5 h-5 mr-2" />
            Launch This Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}
