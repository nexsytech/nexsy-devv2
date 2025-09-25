import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, FileText, Loader2 } from "lucide-react";

export default function SelectAdCopyModal({ 
  open, 
  onClose, 
  creativeOutputs = [], 
  onSelectAdCopy, 
  isGenerating = false,
  productImage 
}) {
  
  const handleSelectCopy = (creativeOutput, copyIndex) => {
    onSelectAdCopy(creativeOutput.id, copyIndex);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            Select Ad Copy for Image Generation
          </DialogTitle>
          <DialogDescription>
            Choose which ad copy should inspire the AI-generated image. The image will be designed to complement your selected copy.
          </DialogDescription>
        </DialogHeader>

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Creating your ad image...</h3>
            <p className="text-slate-600">Our AI is designing a compelling visual based on your selected copy.</p>
          </div>
        )}

        {!isGenerating && creativeOutputs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Ad Copies Found</h3>
            <p className="text-slate-600">Generate some ad copies first before creating images.</p>
          </div>
        )}

        {!isGenerating && creativeOutputs.length > 0 && (
          <div className="space-y-6">
            {creativeOutputs.map((creativeOutput) => (
              <div key={creativeOutput.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {creativeOutput.creative_concept_title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {new Date(creativeOutput.generation_timestamp).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="grid gap-4">
                  {creativeOutput.ad_copies?.map((copy, copyIndex) => (
                    <Card 
                      key={copyIndex} 
                      className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                      onClick={() => handleSelectCopy(creativeOutput, copyIndex)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h5 className="font-semibold text-slate-900 flex-1">
                              {copy.variation_name || `Variation ${copyIndex + 1}`}
                            </h5>
                            <Button 
                              size="sm" 
                              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCopy(creativeOutput, copyIndex);
                              }}
                            >
                              <Wand2 className="w-4 h-4 mr-1" />
                              Use This Copy
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <strong className="text-sm text-slate-600">Headline:</strong>
                              <p className="text-slate-900 font-medium">{copy.headline}</p>
                            </div>
                            
                            <div>
                              <strong className="text-sm text-slate-600">Body:</strong>
                              <p className="text-slate-700 text-sm line-clamp-3">{copy.body_text}</p>
                            </div>
                            
                            {copy.offer_value_proposition && (
                              <div>
                                <strong className="text-sm text-slate-600">Offer:</strong>
                                <p className="text-slate-700 text-sm">{copy.offer_value_proposition}</p>
                              </div>
                            )}
                            
                            <div>
                              <Badge className="bg-blue-100 text-blue-800 font-medium">
                                {copy.call_to_action}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isGenerating && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}