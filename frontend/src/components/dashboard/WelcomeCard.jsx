import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WelcomeCard({ user, profile }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (user?.full_name) return user.full_name.split(' ')[0];
    return user?.email?.split('@')[0] || 'there';
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Welcome to AdGenius
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {getGreeting()}, {getFirstName()}!
            </h1>
            <p className="text-white/80 text-lg mb-6">
              {profile?.setup_completed 
                ? "Your AI marketing team is ready to help you grow your business."
                : "Let's set up your business profile to get personalized recommendations."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl("CampaignManager")}>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
                >
                  Create New Campaign
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("Campaigns")}>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-white/90 font-semibold border-2 border-white"
                >
                  Analyse Performance
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white/60" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}