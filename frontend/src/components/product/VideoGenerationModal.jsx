
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Wand2, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function VideoGenerationModal({ 
  open, 
  onClose, 
  product,
  displayedCopies, 
  imageAssets, 
  onGenerateScript,
  onGenerateVideo,
  isGeneratingScript,
  isGeneratingVideo,
  generatedScript
}) {
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const resetModal = () => {
    setSelectedCopy(null);
    setSelectedImage(null);
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSelectCopy = (copy) => {
    setSelectedCopy(copy);
    setCurrentStep(2);
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    setCurrentStep(3);
  };

  const handleGenerateScript = async () => {
    if (!selectedCopy) return;
    
    try {
      await onGenerateScript({
        product_id: product.id,
        creative_output_id: selectedCopy._creative_output_id,
        ad_copy_index: selectedCopy._copy_index
      });
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error in handleGenerateScript:', error);
      // Don't advance to step 4 if there was an error
      // Optionally, set an error state here to display in the UI
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedCopy || !selectedImage || !generatedScript?.script) return;
    
    try {
      await onGenerateVideo({
        product_id: product.id,
        image_url: selectedImage.asset_url,
        product_name: product.product_name,
        video_script: generatedScript.script,
        creative_output_id: selectedCopy._creative_output_id,
        ad_copy_index: selectedCopy._copy_index
      });
      
      handleClose();
    } catch (error) {
      console.error('Error in handleGenerateVideo:', error);
      // Optionally, set an error state here to display in the UI
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Choose Ad Copy";
      case 2: return "Choose Base Image";
      case 3: return "Generate Video Script";
      case 4: return "Generate Video";
      default: return "Generate AI Video Ad";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Play className="w-6 h-6 text-blue-600" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of 4: Create an AI-powered video ad from your existing copy and visuals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                {step < 4 && <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Ad Copy */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select the ad copy to base your video on:</h3>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {displayedCopies.map((copy, index) => (
                  <Card 
                    key={`${copy._creative_output_id}-${copy._copy_index}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCopy?._creative_output_id === copy._creative_output_id && 
                      selectedCopy?._copy_index === copy._copy_index 
                        ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelectCopy(copy)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{copy.headline}</h4>
                        <Badge variant="outline" className="text-xs">
                          {copy._tone_label}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{copy.body_text}</p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-blue-600 text-white">{copy.call_to_action}</Badge>
                        {/* Show if this copy was used for image generation */}
                        {imageAssets.some(img => 
                          img.associated_creative_output_id === copy._creative_output_id && 
                          img.associated_ad_copy_index === copy._copy_index
                        ) && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Used for Image
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Image */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Selected Copy:</h3>
                <p className="font-medium">{selectedCopy?.headline}</p>
                <p className="text-sm text-slate-600">{selectedCopy?.body_text}</p>
              </div>
              
              <h3 className="text-lg font-semibold">Choose the base image for your video:</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {imageAssets.map((image) => (
                  <div 
                    key={image.id}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 ${
                      selectedImage?.id === image.id ? 'ring-4 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelectImage(image)}
                  >
                    <img 
                      src={image.asset_url} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Highlight if this image was created from the selected copy */}
                    {image.associated_creative_output_id === selectedCopy?._creative_output_id && 
                     image.associated_ad_copy_index === selectedCopy?._copy_index && (
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-green-600 text-white text-xs">
                          Same Copy
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="secondary" className="text-xs">
                        {image.source_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Generate Script */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Selected Elements:</h3>
                <p><strong>Copy:</strong> {selectedCopy?.headline}</p>
                <p><strong>Image:</strong> {selectedImage?.title}</p>
              </div>
              
              <div className="text-center py-8">
                <Button 
                  onClick={handleGenerateScript} 
                  disabled={isGeneratingScript}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Script...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Video Script
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review Script & Generate Video */}
          {currentStep === 4 && generatedScript?.script && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Video Script:</h3>
              
              <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-1">Hook (0-3s):</h4>
                  <p className="text-slate-800">{generatedScript.script.hook_line || 'No hook generated'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-600 mb-1">Body (3-7s):</h4>
                  <p className="text-slate-800">{generatedScript.script.body_lines || 'No body generated'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-600 mb-1">Bridge (7-9s):</h4>
                  <p className="text-slate-800">{generatedScript.script.bridge_line || 'No bridge generated'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-600 mb-1">CTA (9-10s):</h4>
                  <p className="text-slate-800">{generatedScript.script.cta_line || 'No CTA generated'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-amber-600 mb-1">On-Screen Text:</h4>
                  <p className="text-slate-600 text-sm">{generatedScript.script.on_screen_text || 'No on-screen text'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-cyan-600 mb-1">Visual Direction:</h4>
                  <p className="text-slate-600 text-sm">{generatedScript.script.visual_direction || 'No visual direction'}</p>
                </div>
              </div>

              <div className="text-center py-4">
                <Button 
                  onClick={handleGenerateVideo} 
                  disabled={isGeneratingVideo}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video (2-3 min)...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Show error state if step 4 but no script */}
          {currentStep === 4 && !generatedScript?.script && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Script generation failed. Please try again.</p>
              <Button onClick={() => setCurrentStep(3)} variant="outline">
                Go Back and Retry
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
