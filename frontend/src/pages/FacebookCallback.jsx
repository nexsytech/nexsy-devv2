import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { handleFacebookCallback } from "@/api/functions";
import { createPageUrl } from "@/utils";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function FacebookCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("processing");
    const [message, setMessage] = useState("Connecting your Facebook account...");

    useEffect(() => {
        const processCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const error = urlParams.get('error');

                if (error) {
                    setStatus("error");
                    setMessage(`Facebook authorization failed: ${error}`);
                    setTimeout(() => navigate(createPageUrl('CampaignLauncher')), 3000);
                    return;
                }

                if (!code || !state) {
                    setStatus("error");
                    setMessage("Authorization failed: Missing required parameters.");
                    setTimeout(() => navigate(createPageUrl('CampaignLauncher')), 3000);
                    return;
                }

                const { data, error: callbackError } = await handleFacebookCallback({ code, state });

                if (callbackError || !data.success) {
                    setStatus("error");
                    setMessage(callbackError?.message || data.error || "Unknown error occurred");
                } else {
                    setStatus("success");
                    setMessage("Facebook account connected successfully!");
                }

            } catch (error) {
                console.error("Facebook callback error:", error);
                setStatus("error");
                setMessage(`Connection failed: ${error.message}`);
            }

            setTimeout(() => {
                navigate(createPageUrl('CampaignLauncher'));
            }, 3000);
        };

        processCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                {status === "processing" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                            <LoadingSpinner />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Connecting Facebook</h2>
                            <p className="text-slate-600">{message}</p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Successful</h2>
                            <p className="text-slate-600">{message}</p>
                            <p className="text-sm text-slate-500 mt-2">Redirecting you back to the Campaign Launcher...</p>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-2xl">✕</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2 text-red-600">Connection Failed</h2>
                            <p className="text-slate-600">{message}</p>
                            <p className="text-sm text-slate-500 mt-2">Redirecting you back to the Campaign Launcher...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}