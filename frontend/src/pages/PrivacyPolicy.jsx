
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { Button } from "@/components/ui/button"; // Added Button import
import { Link } from "react-router-dom"; // Added Link import
import { createPageUrl } from "@/utils"; // Added createPageUrl import

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* New Navigation Button */}
        <div className="mb-4">
            <Button asChild variant="outline" className="rounded-lg">
                <Link to={createPageUrl('Landing')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Homepage
                </Link>
            </Button>
        </div>
        {/* End New Navigation Button */}

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600">Effective Date: January 7, 2025</p>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-6">
              Nexsy ("we", "our", or "us") is committed to protecting the privacy and security of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered marketing platform.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li><strong>Personal Information:</strong> Name, email address, billing information, and any other data you provide during account registration.</li>
                  <li><strong>Usage Data:</strong> Information about your interactions with our platform, including IP address, device type, and browsing activity.</li>
                  <li><strong>Marketing Data:</strong> Campaign inputs, ad creatives, and performance metrics.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>To provide and improve our services.</li>
                  <li>To personalize user experience and deliver relevant insights.</li>
                  <li>To communicate with you about updates, promotions, and support.</li>
                  <li>To ensure security, prevent fraud, and comply with legal obligations.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Sharing of Information</h2>
                <p className="text-slate-700 mb-3">We do not sell your personal information. We may share data with:</p>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li><strong>Service Providers:</strong> For hosting, analytics, and payment processing.</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
                  <li><strong>Partners:</strong> Only with your consent, for integrations or joint offerings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                <p className="text-slate-700">
                  We implement industry-standard security measures to protect your data. However, no method of transmission or storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
                <p className="text-slate-700">
                  We retain your data as long as necessary to provide our services or as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights</h2>
                <p className="text-slate-700">
                  You have the right to access, update, or delete your personal information. Contact us at <a href="mailto:connect@nexsy.app" className="text-blue-600 hover:text-blue-800 underline">connect@nexsy.app</a> for assistance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Third-Party Services</h2>
                <p className="text-slate-700">
                  Our platform may contain links or integrations with third-party services. We are not responsible for their privacy practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Changes to This Policy</h2>
                <p className="text-slate-700">
                  We may update this policy periodically. Continued use of our platform indicates acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact Us</h2>
                <p className="text-slate-700">
                  If you have any questions, please contact us at: <a href="mailto:connect@nexsy.app" className="text-blue-600 hover:text-blue-800 underline">connect@nexsy.app</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
