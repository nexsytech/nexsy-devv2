
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleTikTokCallback } from '@/api/functions';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function TikTokCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState("Connecting your account..."); // Message to display to the user

    useEffect(() => {
        const processCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('auth_code') || urlParams.get('code');
                const state = urlParams.get('state');
                const errorParam = urlParams.get('error');

                if (errorParam) {
                    setStatus("error");
                    setMessage(`Authorization failed: ${errorParam}. Please try again.`);
                    setTimeout(() => navigate(createPageUrl('CampaignLauncher')), 3000);
                    return;
                }

                if (!code || !state) {
                    setStatus("error");
                    setMessage("Authorization failed: Missing required parameters. Please try again.");
                    setTimeout(() => navigate(createPageUrl('CampaignLauncher')), 3000);
                    return;
                }

                const { data, error: callbackError } = await handleTikTokCallback({ code, state });

                if (callbackError || !data?.success) {
                    setStatus("error");
                    setMessage(callbackError?.message || data?.error || "Failed to connect account. Please try again.");
                } else {
                    setStatus("success");
                    setMessage("Account connected successfully! Redirecting...");
                }

            } catch (err) {
                console.error("TikTok callback error:", err);
                setStatus("error");
                setMessage(`Connection failed: ${err.message || "An unexpected error occurred."}`);
            }

            setTimeout(() => {
                navigate(createPageUrl('CampaignLauncher'));
            }, 3000);
        };

        processCallback();
    }, [navigate]);

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h1>
                <p className="text-slate-700">{message}</p>
                <p className="text-slate-500 mt-2">Redirecting you back to the Campaign Launcher...</p>
            </div>
        );
    }

    return <LoadingSpinner fullPage={true} text={message} />;
}
