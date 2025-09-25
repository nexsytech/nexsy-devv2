import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { X, Copy, Check, Edit, Trash2, Save, XCircle } from "lucide-react";

export default function CopyDetailsModal({ isOpen, onClose, creativeOutput, onUpdate }) {
  const [adCopies, setAdCopies] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedCopy, setEditedCopy] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    if (creativeOutput && creativeOutput.ad_copies) {
      setAdCopies(JSON.parse(JSON.stringify(creativeOutput.ad_copies))); // Deep copy
    }
  }, [creativeOutput]);

  if (!isOpen) return null;

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({...prev, [id]: true }));
    setTimeout(() => setCopiedStates(prev => ({...prev, [id]: false })), 2000);
  };

  const startEditing = (index, copy) => {
    setEditingIndex(index);
    setEditedCopy({ ...copy });
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
    setEditedCopy(null);
  };
  
  const handleInputChange = (field, value) => {
    setEditedCopy(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    let copies = [...adCopies];
    copies[editingIndex] = editedCopy;
    
    const success = await onUpdate(creativeOutput.id, copies);
    if(success) {
        setAdCopies(copies);
        cancelEditing();
    }
  };

  const deleteCopy = async (index) => {
    if (!confirm("Are you sure you want to delete this ad variation?")) return;
    let copies = [...adCopies];
    copies.splice(index, 1);
    
    const success = await onUpdate(creativeOutput.id, copies);
    if(success) {
        setAdCopies(copies);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{creativeOutput.creative_concept_title}</h2>
            <p className="text-slate-600">{creativeOutput.creative_concept_description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {adCopies.map((copy, index) => (
            <div key={index} className="bg-slate-50 p-4 rounded-lg border">
              {editingIndex === index ? (
                // Editing View
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-800">{editedCopy.variation_name}</h3>
                  <div>
                    <label className="text-sm font-medium">Headline</label>
                    <Input value={editedCopy.headline} onChange={(e) => handleInputChange('headline', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Body Text</label>
                    <Textarea value={editedCopy.body_text} onChange={(e) => handleInputChange('body_text', e.target.value)} className="h-24"/>
                  </div>
                   <div>
                    <label className="text-sm font-medium">Call to Action</label>
                    <Input value={editedCopy.call_to_action} onChange={(e) => handleInputChange('call_to_action', e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={cancelEditing}>
                        <XCircle className="w-4 h-4 mr-2"/> Cancel
                    </Button>
                    <Button onClick={saveEdit}>
                        <Save className="w-4 h-4 mr-2"/> Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                // Display View
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-800">{copy.variation_name}</h3>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => startEditing(index, copy)}>
                                <Edit className="w-4 h-4 mr-1"/> Edit
                            </Button>
                             <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteCopy(index)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                  
                  {Object.entries({ Headline: copy.headline, "Body Text": copy.body_text, "Call to Action": copy.call_to_action }).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm font-medium text-slate-600 mb-1">{key}</p>
                      <div className="flex items-start justify-between gap-2 p-3 bg-white rounded-md border">
                        <p className="text-slate-800 flex-1 whitespace-pre-wrap">{value}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(value, `${index}-${key}`)}>
                          {copiedStates[`${index}-${key}`] ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                   <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Platform</p>
                      <p className="text-slate-800 p-3 bg-white rounded-md border capitalize">{copy.platform_optimized}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}