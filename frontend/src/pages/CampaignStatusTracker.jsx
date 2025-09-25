
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from "@/api/entities";
import { LaunchJob } from "@/api/entities";
import { uploadTikTokImage } from "@/api/functions";
import { uploadTikTokVideo } from "@/api/functions";
import { createTikTokCampaign } from "@/api/functions";
import { createTikTokAdGroup } from "@/api/functions";
import { createTikTokAd } from "@/api/functions";
import { createTikTokCustomIdentity } from "@/api/functions";
import { prepareAndUploadTikTokAvatar } from "@/api/functions"; // NEW IMPORT
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Loader2, XCircle, Rocket, ExternalLink, ArrowLeft, Shield, Video, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatusStep = ({ title, status, error, details }) => {
  const getIcon = () => {
    switch (status) {
      case 'pending': return <Loader2 className="w-5 h-5 text-slate-400 animate-pulse" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className={`p-4 rounded-lg flex flex-col items-start gap-2 transition-all duration-300 ${status === 'running' ? 'bg-blue-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-4 w-full">
            <div className="w-8 h-8 flex-shrink-0">{getIcon()}</div>
            <p className="font-semibold text-slate-800 flex-1">{title}</p>
        </div>
        {details && Object.keys(details).length > 0 && (
            <div className="pl-12 text-xs text-slate-600 space-y-1">
                {Object.entries(details).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        {/* Render value based on type for nested objects */}
                        {typeof value === 'object' && value !== null ? (
                            <div className="flex flex-col">
                                {Object.entries(value).map(([subKey, subValue]) => (
                                    <span key={subKey} className="font-mono">
                                        <span className="font-medium capitalize">{subKey}:</span> {String(subValue)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="font-mono">{String(value)}</span>
                        )}
                    </div>
                ))}
            </div>
        )}
        {status === 'failed' && error && (
             <details className="w-full pl-12 mt-2 text-xs">
                <summary className="cursor-pointer text-red-600 font-medium">Show Error Details <ChevronDown className="inline w-3 h-3 ml-1" /></summary>
                <pre className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-900 overflow-auto whitespace-pre-wrap">
                    {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
                </pre>
            </details>
        )}
    </div>
  );
};

// Define the steps and their corresponding job statuses
const STEPS = [
  { id: 'upload_asset', title: 'Uploading & Processing Assets', completedStatus: 'ASSETS_DONE' },
  { id: 'create_identity', title: 'Creating Advertiser Identity', completedStatus: 'IDENTITY_DONE' },
  { id: 'create_campaign', title: 'Setting Up Campaign Structure', completedStatus: 'CAMPAIGN_DONE' },
  { id: 'create_ad_group', title: 'Configuring Targeting & Budget', completedStatus: 'ADGROUP_DONE' },
  { id: 'create_ad', title: 'Publishing Your Ad', completedStatus: 'AD_DONE' },
];

const statusOrder = ["STARTED", "ASSETS_DONE", "IDENTITY_DONE", "CAMPAIGN_DONE", "ADGROUP_DONE", "AD_DONE", "SUCCEEDED", "FAILED"];
const isStatusGreaterOrEqual = (jobStatus, targetStatus) => {
    return statusOrder.indexOf(jobStatus) >= statusOrder.indexOf(targetStatus);
};

// Helper to create initial status object
const initialStatuses = STEPS.reduce((acc, step) => {
  acc[step.id] = 'pending';
  return acc;
}, {});

export default function CampaignStatusTracker() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get idempotency key from URL to make the process resume-safe on reload
  const urlParams = new URLSearchParams(location.search);
  const idempotencyKeyFromUrl = urlParams.get('key');
  
  // Make campaignConfig a state variable so it can be updated if loaded from DB
  const [campaignConfig, setCampaignConfig] = useState(location.state?.campaignConfig);
  const idempotencyKey = idempotencyKeyFromUrl || campaignConfig?.idempotency_key;

  // State for the LaunchJob record from the DB
  const [job, setJob] = useState(null);
  
  // State to manage the status of each step (e.g., pending, running, completed, failed)
  const [statuses, setStatuses] = useState(initialStatuses);
  // State to hold any error that occurs during the process
  const [error, setError] = useState(null);
  // State for current user data (fetched at start)
  const [currentUser, setCurrentUser] = useState(null);
  // State to display details about uploaded assets
  const [assetDetails, setAssetDetails] = useState({});
  // State to display a summary of the created creative
  const [creativeSummary, setCreativeSummary] = useState(null);
  // State to display details about location validation
  const [locationDetails, setLocationDetails] = useState(null);

  // State to indicate if the campaign creation process is ongoing
  const [isProcessing, setIsProcessing] = useState(false);
  // nxTag is now derived from job, no longer a separate state

  // This function acts as a finalizer, triggered upon successful completion of all steps
  const finishLaunch = useCallback(() => {
    // These IDs are now read from the job object, so no need to pass them explicitly here.
    // The main useEffect will ensure job.tiktok_campaign_id etc. are available.
    console.log("[CampaignLaunch] All core steps completed successfully.");
    // The final success toast is managed by the main useEffect
  }, []);

  const executeStep = useCallback(async (stepKey, currentJob) => {
    // Defensive check
    if (!currentJob || !currentJob.campaign_config) {
        console.error(`[CampaignLaunch] executeStep received invalid job or campaign_config for step ${stepKey}.`);
        throw new Error("Campaign configuration not available for step execution.");
    }

    const config = currentJob.campaign_config;
    const commonParams = {
      launch_mode: config.launch_mode,
      advertiser_id: config.launch_mode === 'live' ? config.advertiser_id : undefined,
      nx_tag: currentJob.nx_tag,
      idempotency_key: currentJob.idempotency_key,
    };

    setStatuses(prev => ({ ...prev, [stepKey]: 'running' }));
    console.log(`[CampaignLaunch] Executing step: ${stepKey} (Job Status: ${currentJob.status})`);

    try {
      let updatedJobData = {}; // Collect data to update job at the end of the step

      switch (stepKey) {
        case 'upload_asset':
          console.log(`[CampaignLaunch] Step 1: Uploading assets with optimized timing...`);
          
          // 1. AVATAR UPLOAD (400x400, ≤2MB, JPEG, for CUSTOMIZED_USER identity)
          if (!currentJob.tiktok_avatar_image_id) {
            console.log(`[CampaignLaunch] Uploading avatar...`);
            
            try {
              const avatarRes = await prepareAndUploadTikTokAvatar({
                  ...commonParams,
                  image_url: config.product_image_url,
                  file_name_prefix: config.product_name.replace(/\s+/g, '_')
              });
              
              if (!avatarRes.data?.image_id) {
                  throw new Error(avatarRes.data?.error || avatarRes.error?.message || "Failed to upload compliant avatar.");
              }
              updatedJobData.tiktok_avatar_image_id = avatarRes.data.image_id;
              updatedJobData.tiktok_avatar_width = avatarRes.data.width;
              updatedJobData.tiktok_avatar_height = avatarRes.data.height;
              updatedJobData.tiktok_avatar_size_kb = avatarRes.data.file_size_kb;
              console.log(`[CampaignLaunch] Avatar uploaded: ${avatarRes.data.image_id}`);
            } catch (avatarError) {
              if (avatarError.message && (avatarError.message.includes('Rate limit') || avatarError.message.includes('rate limit')) || avatarError.response?.status === 429) {
                throw new Error("TikTok API rate limit exceeded during avatar upload. Please wait 5-10 minutes before trying again.");
              }
              throw avatarError;
            }
          } else {
            console.log(`[CampaignLaunch] Avatar already uploaded, skipping.`);
          }

          // SPEED OPTIMIZATION: Reduced delay between uploads from 12s to 6s
          console.log(`[CampaignLaunch] Adding 6-second delay between asset uploads...`);
          await new Promise(resolve => setTimeout(resolve, 6000));

          // 2. PRIMARY CREATIVE ASSET UPLOAD
          if (!config.asset_url) {
              throw new Error("Creative asset URL is missing in campaign configuration.");
          }

          const isVideoAsset = config.media_type === 'video' || 
                              config.asset_url.includes('.mp4') || 
                              config.asset_url.includes('.mov') || 
                              config.asset_url.includes('video');

          if (isVideoAsset) {
            // 2a. VIDEO UPLOAD
            if (!currentJob.tiktok_video_id) {
              console.log(`[CampaignLaunch] Uploading video creative...`);
              try {
                const videoRes = await uploadTikTokVideo({
                    ...commonParams,
                    video_url: config.asset_url,
                    file_name_prefix: config.product_name.replace(/\s+/g, '_'),
                });
                
                if (!videoRes.data?.video_id) {
                    throw new Error(videoRes.data?.error || videoRes.error?.message || "Failed to upload video.");
                }
                updatedJobData.tiktok_video_id = videoRes.data.video_id;
                console.log(`[CampaignLaunch] Video uploaded: ${videoRes.data.video_id}`);
              } catch (videoError) {
                if (videoError.message && (videoError.message.includes('Rate limit') || videoError.message.includes('rate limit'))) {
                  throw new Error("TikTok API rate limit exceeded during video upload. Please wait 5-10 minutes before trying again.");
                }
                throw videoError;
              }
            } else {
              console.log(`[CampaignLaunch] Video already uploaded, skipping.`);
            }

            // For videos, also upload as poster image (optional but recommended for better performance)
            if (!currentJob.tiktok_image_id) { // This now serves as the 'ad_creative' image for video
              console.log(`[CampaignLaunch] Uploading video poster image...`);
              // SPEED OPTIMIZATION: Reduced delay from 15s to 4s
              await new Promise(resolve => setTimeout(resolve, 4000));
              
              try {
                const posterRes = await uploadTikTokImage({
                    ...commonParams,
                    image_url: config.asset_url, // Use same video URL, TikTok will extract frame
                    file_name_prefix: config.product_name.replace(/\s+/g, '_'),
                    image_type: "ad_cover" // For video poster
                });
                
                if (posterRes.data?.image_id) {
                    updatedJobData.tiktok_image_id = posterRes.data.image_id; // Store as tiktok_image_id for general creative ID
                    updatedJobData.tiktok_image_width = posterRes.data.width;
                    updatedJobData.tiktok_image_height = posterRes.data.height;
                    updatedJobData.tiktok_image_size_kb = posterRes.data.file_size_kb;
                    console.log(`[CampaignLaunch] Video poster uploaded: ${posterRes.data.image_id}`);
                } else {
                  console.warn(`[CampaignLaunch] Video poster upload failed or returned no image_id.`);
                }
              } catch (coverError) {
                console.warn(`[CampaignLaunch] Video poster image upload failed (non-critical):`, coverError.message);
                // Continue without poster image if it fails
              }
            } else {
              console.log(`[CampaignLaunch] Video poster image already uploaded, skipping.`);
            }

          } else {
            // 2b. IMAGE CREATIVE UPLOAD
            if (!currentJob.tiktok_image_id) {
              console.log(`[CampaignLaunch] Uploading image creative...`);
              try {
                const imageRes = await uploadTikTokImage({
                    ...commonParams,
                    image_url: config.asset_url,
                    file_name_prefix: config.product_name.replace(/\s+/g, '_'),
                    image_type: "ad_creative"
                });
                
                if (!imageRes.data?.image_id) {
                    throw new Error(imageRes.data?.error || imageRes.error?.message || "Failed to upload image.");
                }
                updatedJobData.tiktok_image_id = imageRes.data.image_id;
                updatedJobData.tiktok_image_width = imageRes.data.width;
                updatedJobData.tiktok_image_height = imageRes.data.height;
                updatedJobData.tiktok_image_size_kb = imageRes.data.file_size_kb;
                console.log(`[CampaignLaunch] Image uploaded: ${imageRes.data.image_id}`);
              } catch (imageError) {
                if (imageError.message && (imageError.message.includes('Rate limit') || imageError.message.includes('rate limit'))) {
                  throw new Error("TikTok API rate limit exceeded during image upload. Please wait 5-10 minutes before trying again.");
                }
                throw imageError;
              }
            } else {
              console.log(`[CampaignLaunch] Image already uploaded, skipping.`);
            }
          }

          // Set asset details for UI display (primarily the main creative)
          let assetDetailsToSet = {};
          if (isVideoAsset) {
            assetDetailsToSet = {
                video_id: updatedJobData.tiktok_video_id || currentJob.tiktok_video_id,
                poster_image_id: updatedJobData.tiktok_image_id || currentJob.tiktok_image_id,
                type: 'video',
            };
          } else {
            assetDetailsToSet = {
                image_id: updatedJobData.tiktok_image_id || currentJob.tiktok_image_id,
                type: 'image',
            };
          }
          setAssetDetails(assetDetailsToSet);
          break;

        case 'create_identity':
          console.log(`[CampaignLaunch] Step 2: Creating TikTok identity...`);
          
          if (!currentJob.tiktok_identity_id) {
            if (!currentJob.tiktok_avatar_image_id) {
              throw new Error("Avatar image must be uploaded before creating identity.");
            }

            const identityRes = await createTikTokCustomIdentity({
              ...commonParams,
              display_name: config.product_name.substring(0, 50), // TikTok has length limits
              avatar_image_id: currentJob.tiktok_avatar_image_id
            });
            
            if (!identityRes.data?.identity_id) {
              throw new Error(identityRes.data?.error || identityRes.error?.message || "Failed to create TikTok identity.");
            }
            updatedJobData.tiktok_identity_id = identityRes.data.identity_id;
            console.log(`[CampaignLaunch] Identity created: ${identityRes.data.identity_id}`);
          } else {
            console.log(`[CampaignLaunch] Identity already created, skipping.`);
          }
          break;

        case 'create_campaign':
          console.log(`[CampaignLaunch] Step 3: Creating TikTok campaign...`);
          
          if (!currentJob.tiktok_campaign_id) {
            const campaignRes = await createTikTokCampaign({
              ...commonParams,
              campaign_name: config.campaign_name,
              daily_budget: config.daily_budget
            });
            
            if (!campaignRes.data?.campaign_id) {
              throw new Error(campaignRes.data?.error || campaignRes.error?.message || "Failed to create TikTok campaign.");
            }
            updatedJobData.tiktok_campaign_id = campaignRes.data.campaign_id;
            console.log(`[CampaignLaunch] Campaign created: ${campaignRes.data.campaign_id}`);
          } else {
            console.log(`[CampaignLaunch] Campaign already created, skipping.`);
          }
          break;

        case 'create_ad_group':
          console.log(`[CampaignLaunch] Step 4: Creating TikTok ad group with preflight location validation...`);
          
          if (!currentJob.tiktok_adgroup_id) {
            if (!currentJob.tiktok_campaign_id) {
              throw new Error("Campaign must be created before creating ad group.");
            }

            const adGroupRes = await createTikTokAdGroup({
              ...commonParams,
              campaign_id: currentJob.tiktok_campaign_id,
              adgroup_name: `${config.product_name} Ad Group`,
              daily_budget: config.daily_budget,
              target_country_code: config.target_country_code,
              target_gender: config.target_gender,
              target_age_min: config.target_age_min,
              target_age_max: config.target_age_max,
              campaign_duration: config.campaign_duration,
              product_link: config.product_link
            });
            
            if (!adGroupRes.data?.adgroup_id) {
              throw new Error(adGroupRes.data?.error || adGroupRes.error?.message || "Failed to create TikTok ad group.");
            }
            updatedJobData.tiktok_adgroup_id = adGroupRes.data.adgroup_id;
            
            // Store location change info if applicable and update state for UI
            if (adGroupRes.data.location_changed) {
              updatedJobData.location_warning = adGroupRes.data.location_warning;
              updatedJobData.original_target = adGroupRes.data.original_target;
              updatedJobData.actual_target = adGroupRes.data.actual_target;
              setLocationDetails({
                warning: adGroupRes.data.location_warning,
                original_target: adGroupRes.data.original_target,
                actual_target: adGroupRes.data.actual_target,
              });
            }
            
            console.log(`[CampaignLaunch] Ad group created: ${adGroupRes.data.adgroup_id}`);
          } else {
            console.log(`[CampaignLaunch] Ad group already created, skipping.`);
          }
          break;

        case 'create_ad':
          console.log(`[CampaignLaunch] Step 5: Creating TikTok ad...`);
          
          const isVideoAssetForAd = config.media_type === 'video' || 
                              config.asset_url.includes('.mp4') || 
                              config.asset_url.includes('.mov') || 
                              config.asset_url.includes('video');

          if (!currentJob.tiktok_ad_id) {
            if (!currentJob.tiktok_adgroup_id || !currentJob.tiktok_identity_id) {
              throw new Error("Ad group and identity must be created before creating ad.");
            }
            if (!currentJob.tiktok_image_id && !currentJob.tiktok_video_id) {
              throw new Error("At least one creative asset (image or video) must be uploaded before creating ad.");
            }

            const adPayload = {
                ...commonParams,
                adgroup_id: currentJob.tiktok_adgroup_id,
                ad_name: `${config.product_name} Ad`, 
                ad_text: config.ad_copy.body_text,
                call_to_action: config.ad_copy.call_to_action,
                image_id: !isVideoAssetForAd ? currentJob.tiktok_image_id : undefined,
                video_id: isVideoAssetForAd ? currentJob.tiktok_video_id : undefined,
                cover_image_id: isVideoAssetForAd ? currentJob.tiktok_image_id : undefined, // Use tiktok_image_id for video poster
                identity_type: "CUSTOMIZED_USER",
                identity_id: currentJob.tiktok_identity_id,
                avatar_image_id: currentJob.tiktok_avatar_image_id,
                product_link: config.product_link,
                avatar_width: currentJob.tiktok_avatar_width || 400,
                avatar_height: currentJob.tiktok_avatar_height || 400,
                avatar_size_kb: currentJob.tiktok_avatar_size_kb || 'unknown',
            };

            // Clean up undefined values
            Object.keys(adPayload).forEach(key => {
                if (adPayload[key] === undefined || adPayload[key] === null) {
                    delete adPayload[key];
                }
            });

            console.log(`[CampaignLaunch] Final ad payload with metadata:`, JSON.stringify(adPayload, null, 2));

            const adRes = await createTikTokAd(adPayload);
            
            if (!adRes.data?.ad_id) {
              console.error(`[CampaignLaunch] Ad creation failed. Full response:`, adRes);
              throw new Error(adRes.data?.error || adRes.error?.message || "Failed to create TikTok ad.");
            }
            updatedJobData.tiktok_ad_id = adRes.data.ad_id;
            console.log(`[CampaignLaunch] Ad created: ${adRes.data.ad_id}`);
          } else {
            console.log(`[CampaignLaunch] Ad already created, skipping.`);
          }
          
          // Update creative summary based on the created ad (or existing ad)
          setCreativeSummary({
              ad_format: isVideoAssetForAd ? 'SINGLE_VIDEO' : 'SINGLE_IMAGE',
              asset_id: (isVideoAssetForAd ? currentJob.tiktok_video_id : currentJob.tiktok_image_id),
              call_to_action: config.ad_copy.call_to_action,
              landing_page_url: config.product_link,
              identity_id: currentJob.tiktok_identity_id,
              avatar_image_id: currentJob.tiktok_avatar_image_id,
              cover_image_id: isVideoAssetForAd ? (currentJob.tiktok_image_id || updatedJobData.tiktok_image_id) : undefined, // Video poster
          });
          break;

        default:
          throw new Error(`Unknown step: ${stepKey}`);
      }

      console.log(`[CampaignLaunch] Step '${stepKey}' completed successfully`);

      // SPEED OPTIMIZATION: Reduced delays between steps to 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Persist state after successful step.
      const stepCompletedStatus = STEPS.find(s => s.id === stepKey)?.completedStatus;
      const newJob = await LaunchJob.update(currentJob.id, {
        ...updatedJobData, // IDs generated in this step and location validation data
        status: stepCompletedStatus,
        error_log: null // Clear any previous error for this job
      });
      setJob(newJob); // Update local job state to trigger next step in useEffect
      setStatuses(prev => ({ ...prev, [stepKey]: 'completed' })); // Set UI status
      
    } catch (err) {
      console.error(`[CampaignLaunch] Error during step '${stepKey}':`, err);
      setIsProcessing(false);

      const failedStepId = stepKey;
      setStatuses(prev => ({ ...prev, [failedStepId]: 'failed' }));

      const errorMessage = err.response?.data ?
          { message: err.response.data.message || err.response.data.error, payload: err.response.data.sent_payload } :
          { message: err.message || `An unknown error occurred during step: ${failedStepId}` };

      setError(errorMessage);

      // Enhanced error handling for recovery scenarios
      let errorPayload = {
        step: failedStepId,
        message: errorMessage.message,
        details: typeof err === 'object' ? JSON.stringify(err) : String(err),
        timestamp: new Date().toISOString()
      };

      // Special handling for rate limit errors
      if (errorMessage.message && (errorMessage.message.includes('Rate limit') || errorMessage.message.includes('rate limit'))) {
        errorPayload.is_rate_limited = true;
        errorPayload.retry_after_minutes = stepKey === 'upload_asset' ? 10 : 5;
        errorPayload.suggested_action = `Wait ${errorPayload.retry_after_minutes} minutes and try again. Rate limits are imposed by TikTok to ensure fair API usage.`;
        errorPayload.nx_tag = currentJob.nx_tag;
      }

      // Special handling for state inconsistency errors
      if (errorMessage.message && errorMessage.message.includes('state inconsistency')) {
        errorPayload.recovery_needed = true;
        errorPayload.suggested_action = errorMessage.message.includes('check your TikTok Ads Manager') 
          ? 'Check TikTok Ads Manager and contact support with AdGroup ID if found'
          : 'Try again in a few minutes or contact support';
        // Add nx_tag to errorPayload for display purposes in the UI
        errorPayload.nx_tag = currentJob.nx_tag;
      }

      LaunchJob.update(currentJob.id, { status: 'FAILED', error_log: errorPayload }).catch(updateErr => console.error("Failed to update job with error:", updateErr));

      // Enhanced error toast for different scenarios
      if (errorPayload.is_rate_limited) {
        toast.error("TikTok API Rate Limit Reached", {
          description: `Please wait ${errorPayload.retry_after_minutes} minutes before trying again. This helps ensure fair API usage for all users.`,
          duration: 15000
        });
      } else if (errorPayload.recovery_needed) {
        toast.error("Campaign creation requires manual verification", {
          description: "The ad group may have been created but cannot be detected. Please check your TikTok Ads Manager.",
          duration: 10000
        });
      } else {
        toast.error("Campaign creation failed", {
          description: typeof errorMessage === 'object' ? errorMessage.message : errorMessage
        });
      }
    }
  }, [setStatuses, setError, setAssetDetails, setCreativeSummary, setLocationDetails, prepareAndUploadTikTokAvatar, uploadTikTokImage, uploadTikTokVideo, createTikTokCampaign, createTikTokAdGroup, createTikTokAd]);


  // Main orchestration useEffect: now finds or creates a LaunchJob
  useEffect(() => {
    if (!idempotencyKey) {
      toast.error("Missing campaign launch key. Please start again from the campaign launcher.");
      navigate(createPageUrl('CampaignLauncher'));
      return;
    }

    const startProcess = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Find or create the job using the persistent key
        const existingJobs = await LaunchJob.filter({ idempotency_key: idempotencyKey });
        let currentJob;

        if (existingJobs.length > 0) {
          console.log("Found existing launch job:", existingJobs[0].id);
          currentJob = existingJobs[0];
          
          // Load campaignConfig from the job if it's not in location.state
          // If we don't have campaignConfig from location.state, try to restore it from the job
          if (!campaignConfig && currentJob.campaign_config) {
            console.log("Restored campaign config from job for resume.");
            setCampaignConfig(currentJob.campaign_config);
          }
        } else {
          // If no existing job, we must have campaignConfig from location.state to start a new one
          if (!campaignConfig) {
            toast.error("Campaign configuration is missing. Cannot start new campaign.");
            navigate(createPageUrl('CampaignLauncher'));
            return;
          }
          
          // Add validation for required fields in campaign config
          if (!campaignConfig.asset_url || !campaignConfig.product_image_url) {
            console.error("Campaign config missing asset_url or product_image_url:", campaignConfig);
            toast.error("Campaign configuration is incomplete (missing asset or product image). Please start again.");
            navigate(createPageUrl('CampaignLauncher'));
            return;
          }
          
          console.log("Creating new launch job for key:", idempotencyKey);
          console.log("Campaign config asset_url:", campaignConfig.asset_url);
          
          const tag = "[NX:" + idempotencyKey.slice(0, 10) + "]";
          currentJob = await LaunchJob.create({
            idempotency_key: idempotencyKey,
            user_email: user.email,
            product_id: campaignConfig.product_id, // Assuming product_id is in campaignConfig
            launch_mode: campaignConfig.launch_mode,
            status: 'STARTED',
            nx_tag: tag,
            campaign_config: campaignConfig // Store config in job for persistence
          });
        }
        
        setJob(currentJob); // Set the job state
        
        // Add final validation that job has campaign_config with asset_url
        if (!currentJob.campaign_config || !currentJob.campaign_config.asset_url || !currentJob.campaign_config.product_image_url) {
          console.error("Job campaign_config missing or incomplete:", currentJob.campaign_config);
          toast.error("Campaign configuration is incomplete. Please start again.");
          navigate(createPageUrl('CampaignLauncher'));
          return;
        }
        
        console.log("Job campaign config asset_url:", currentJob.campaign_config.asset_url);
        
        // Re-hydrate UI specific states from the job for consistent display
        if (currentJob.error_log) setError(currentJob.error_log);
        if (currentJob.location_warning) { // Rehydrate location details
          setLocationDetails({
            warning: currentJob.location_warning,
            original_target: currentJob.original_target,
            actual_target: currentJob.actual_target,
          });
        }
        // assetDetails and creativeSummary will be reconstructed by executeStep on resume if needed, or by specific logic if the step is skipped.
        
        // Initialize statuses based on job's persisted state
        const tempStatuses = { ...initialStatuses };
        for (const step of STEPS) {
            if (isStatusGreaterOrEqual(currentJob.status, step.completedStatus)) {
                tempStatuses[step.id] = 'completed';
            } else if (currentJob.error_log && currentJob.error_log.step === step.id && currentJob.status === 'FAILED') {
                tempStatuses[step.id] = 'failed';
            } else {
                tempStatuses[step.id] = 'pending'; // Future steps
            }
        }
        setStatuses(tempStatuses);

        setIsProcessing(true); // This will trigger the executor useEffect
      } catch (e) {
        console.error("Failed to initialize launch process:", e);
        toast.error("Failed to initialize campaign launch.");
        setIsProcessing(false);
      }
    };
    
    startProcess();
  }, [idempotencyKey, navigate, campaignConfig, setAssetDetails, setCreativeSummary, setLocationDetails]);

  // Executor useEffect: now resume-aware with enhanced rate limit handling
  useEffect(() => {
    // Only proceed if processing is enabled, job exists, and not in a final state
    if (!isProcessing || !job || job.status === 'FAILED' || job.status === 'SUCCEEDED') {
        return;
    }

    // Crucial check: Ensure campaignConfig is loaded from job before proceeding
    if (!job.campaign_config) {
      console.warn("[CampaignLaunch] job.campaign_config is not yet available for execution. Waiting...");
      return;
    }

    // Check if we recently hit rate limits and should wait
    if (job.error_log?.is_rate_limited && job.error_log?.timestamp) {
      const rateLimitTime = new Date(job.error_log.timestamp).getTime();
      const now = Date.now();
      const minutesSinceRateLimit = (now - rateLimitTime) / (1000 * 60);
      const waitMinutes = job.error_log.retry_after_minutes || 5;
      
      if (minutesSinceRateLimit < waitMinutes) {
        const remainingMinutes = Math.ceil(waitMinutes - minutesSinceRateLimit);
        console.log(`[CampaignLaunch] Still in rate limit cooldown. ${remainingMinutes} minutes remaining.`);
        return;
      } else {
        console.log(`[CampaignLaunch] Rate limit cooldown expired. Resuming execution...`);
        // Clear rate limit specific error once cooldown is over to allow retry
        setError(prev => ({ ...prev, is_rate_limited: false })); // Temporarily clear for UI
      }
    }

    // Determine the next step to execute
    const findNextStep = () => {
        for (const step of STEPS) {
            if (!isStatusGreaterOrEqual(job.status, step.completedStatus)) {
                return step;
            }
        }
        return null; // All steps completed or job status is SUCCEEDED
    };

    const nextStep = findNextStep();

    if (nextStep) {
        // Enhanced delay calculation based on step and previous errors
        let delayMs = 2000; // Base delay
        
        // Increase delay if we're retrying after rate limits
        if (job.error_log?.is_rate_limited) {
          delayMs = 15000; // 15 seconds for rate limit recovery
        }
        
        // Increase delay for asset upload step (most rate limit prone)
        if (nextStep.id === 'upload_asset') {
          delayMs = Math.max(delayMs, 5000); // Minimum 5 seconds for asset uploads
        }
        
        console.log(`[CampaignLaunch] Next step identified: ${nextStep.id}. Delaying ${delayMs}ms before execution.`);
        const timer = setTimeout(() => {
            executeStep(nextStep.id, job);
        }, delayMs);
        return () => clearTimeout(timer); // Cleanup timer if component unmounts or job/isProcessing changes
    } else {
        // All steps are completed (nextStep is null)
        finishLaunch();
        setIsProcessing(false);
        toast.success("🎉 Live TikTok Campaign Created Successfully! (Campaign is paused for your review)");
        // Final job status update if not already SUCCEEDED
        if (job.status !== 'SUCCEEDED') {
            LaunchJob.update(job.id, { status: 'SUCCEEDED' }).catch(err => console.error("Failed to update final job status:", err));
        }
    }

  }, [isProcessing, job, executeStep, finishLaunch, setError]); // Added setError to dependency array

  const findNextNextStep = useCallback(() => { // Defined findNextNextStep function to avoid ESLint warning for 'findNextStep'
    if (!job) return null;
    for (const step of STEPS) {
      if (!isStatusGreaterOrEqual(job.status, step.completedStatus)) {
        return step;
      }
    }
    return null;
  }, [job]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('CampaignLauncher'))} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign Launcher
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {job?.campaign_config?.launch_mode === 'live' ? 'Creating Live Campaign' : 'Creating Test Campaign'}
          </h1>
          <p className="text-slate-600">
            {job?.campaign_config?.launch_mode === 'live'
              ? 'Setting up your live TikTok campaign with production-ready assets...'
              : 'Creating a test campaign in TikTok\'s sandbox environment...'
            }
          </p>
        </div>

        <Card className="rounded-xl shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-6 h-6 text-indigo-600" />
              Campaign Creation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dynamically render StatusSteps based on the STEPS array */}
            {STEPS.map((step) => (
                <StatusStep
                    key={step.id}
                    title={step.title}
                    status={statuses[step.id]}
                    // Pass specific details for the asset upload step or location details
                    details={
                        step.id === 'upload_asset' ? assetDetails :
                        step.id === 'create_ad_group' ? locationDetails :
                        null
                    }
                    // Pass error only if this specific step failed
                    error={error && statuses[step.id] === 'failed' ? error : null}
                />
            ))}

            {/* Creative Summary Card - Show only if creativeSummary data is available */}
            {creativeSummary && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            {/* Display appropriate icon based on media type */}
                            {job?.campaign_config?.media_type === 'video' ? <Video className="w-4 h-4 text-slate-700" /> : <ImageIcon className="w-4 h-4 text-slate-700" />}
                            Creative Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs bg-white p-3 rounded-md overflow-auto">
                            {JSON.stringify(creativeSummary, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Success State Block: Appears when all steps are completed successfully and no error */}
            {job?.status === 'SUCCEEDED' && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    {job?.campaign_config?.launch_mode === 'live' ? 'Live Campaign Created!' : 'Test Campaign Created!'}
                  </h3>
                </div>

                {job?.campaign_config?.launch_mode === 'live' && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      <strong>Campaign Status:</strong> Paused for your review. Activate when ready to go live.
                    </p>
                  </div>
                )}

                <p className="text-green-700 mb-4">
                  {job?.campaign_config?.launch_mode === 'live'
                    ? 'Your campaign is ready to launch with professional-grade assets and targeting.'
                    : 'Your test campaign has been created successfully in the sandbox environment.'
                  }
                </p>
                <Button
                  // Use individual ID states for navigation to AdVerification page
                  onClick={() => navigate(createPageUrl(`AdVerification?campaignId=${job?.tiktok_campaign_id}&adGroupId=${job?.tiktok_adgroup_id}&adId=${job?.tiktok_ad_id}&mode=${job?.campaign_config?.launch_mode}`))}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Campaign Details
                </Button>
              </div>
            )}

            {/* Enhanced Error State Block */}
            {job?.status === 'FAILED' && (
              <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Campaign Creation Failed</h3>
                </div>
                <p className="text-red-700 mb-4">
                  {typeof error === 'string' ? error : error?.message || 'An unknown error occurred.'}
                </p>
                
                {/* Special recovery guidance for state inconsistency */}
                {job?.error_log?.recovery_needed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Manual Verification Required</h4>
                    <p className="text-sm text-yellow-800 mb-2">
                      {job.error_log.suggested_action}
                    </p>
                    {job.error_log.nx_tag && (
                      <p className="text-xs text-yellow-700 font-mono">
                        Search for: {job.error_log.nx_tag}
                      </p>
                    )}
                  </div>
                )}
                {/* Special recovery guidance for rate limit errors */}
                {job?.error_log?.is_rate_limited && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-900 mb-2">TikTok API Rate Limit</h4>
                    <p className="text-sm text-yellow-800 mb-2">
                      {job.error_log.suggested_action}
                    </p>
                    {job.error_log.nx_tag && (
                      <p className="text-xs text-yellow-700 font-mono">
                        Reference Key: {job.error_log.nx_tag}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                        // Reset local states related to progress for UI
                        setIsProcessing(false);
                        setError(null); 
                        setStatuses(initialStatuses);
                        setAssetDetails({});
                        setCreativeSummary(null);
                        setLocationDetails(null); // Clear location details on retry
                        
                        if (job) {
                            try {
                                // Reset job status in DB to allow re-execution from the failed step
                                // Retain all tiktok_ids for steps that already completed successfully
                                const updatedJob = await LaunchJob.update(job.id, { 
                                    status: 'STARTED', // Reset to STARTED to trigger re-evaluation from start
                                    error_log: null, // Clear error
                                    // Keep existing IDs. The executeStep logic now handles "skip if already done".
                                });
                                setJob(updatedJob); // Update local job state to trigger re-render and re-evaluation
                                toast.info("Attempting to restart campaign creation process.");
                                setIsProcessing(true); // Trigger the executor useEffect to re-evaluate
                            } catch (updateErr) {
                                console.error("Failed to reset job status for retry:", updateErr);
                                toast.error("Failed to reset job. Please try refreshing the page.");
                            }
                        }
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(createPageUrl('Learning'))}
                  >
                    Get Help
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
