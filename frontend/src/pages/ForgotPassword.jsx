import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import { resetPassword } from "@/lib/firebase";
import NexsyLogo from "@/assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    const { success, error: resetError } = await resetPassword(email);
    
    if (success) {
      setSent(true);
    } else {
      setError(resetError || "Failed to send reset email");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to={createPageUrl("Login")} className="inline-flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-slate-600">Back to sign in</span>
          </Link>
          
          <div className="flex justify-center mb-6">
            <img src={NexsyLogo} alt="Nexsy logo" className="h-16 w-16 rounded-2xl shadow-lg object-contain bg-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-slate-600">
            {sent 
              ? "We've sent you a password reset link"
              : "Enter your email to receive a reset link"
            }
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Password Reset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Email Sent!</h3>
                  <p className="text-slate-600 text-sm">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Check your email and click the link to reset your password. The link will expire in 24 hours.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => setSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </>
            )}

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Remember your password?{" "}
                <Link 
                  to={createPageUrl("Login")} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}