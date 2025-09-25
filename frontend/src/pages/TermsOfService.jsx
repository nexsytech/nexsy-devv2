
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button asChild variant="outline" className="rounded-lg">
            <Link to={createPageUrl('Landing')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Link>
          </Button>
        </div>
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600">Effective Date: January 7, 2025</p>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-6">
              These Terms of Service ("Terms") govern your access and use of Nexsy's platform and services ("Services"). By using our Services, you agree to these Terms.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Eligibility</h2>
                <p className="text-slate-700">
                  You must be at least 18 years old to use our Services. By registering, you represent that you meet this requirement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Account Registration</h2>
                <p className="text-slate-700">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use of Services</h2>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>You agree to use the Services only for lawful purposes.</li>
                  <li>You shall not misuse the platform by attempting to hack, reverse engineer, or exploit it.</li>
                  <li>You are responsible for the content and data you upload.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Subscription & Payments</h2>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>Some Services require payment. Fees are specified during purchase.</li>
                  <li>All payments are non-refundable unless stated otherwise.</li>
                  <li>We reserve the right to change pricing with notice.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Intellectual Property</h2>
                <p className="text-slate-700">
                  All content, software, and materials provided by Nexsy are our intellectual property. You are granted a limited, non-exclusive, non-transferable license to use the Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. User Content</h2>
                <p className="text-slate-700">
                  You retain ownership of the content you create using our platform. By using our Services, you grant us a license to process and store this content as needed to provide our Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Service Availability</h2>
                <p className="text-slate-700">
                  We strive to keep the Services available but do not guarantee uninterrupted or error-free operation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-slate-700">
                  Nexsy is not liable for any indirect, incidental, or consequential damages arising from the use of our Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Termination</h2>
                <p className="text-slate-700">
                  We may suspend or terminate your access if you violate these Terms. You may cancel your account at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Governing Law</h2>
                <p className="text-slate-700">
                  These Terms are governed by the laws of United States and Malaysia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Changes to Terms</h2>
                <p className="text-slate-700">
                  We may modify these Terms at any time. Continued use of our Services indicates acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact</h2>
                <p className="text-slate-700">
                  For any questions, please reach out to: <a href="mailto:connect@nexsy.app" className="text-blue-600 hover:text-blue-800 underline">connect@nexsy.app</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
