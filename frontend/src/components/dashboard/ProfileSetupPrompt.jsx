import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProfileSetupPrompt() {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  2 minutes
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Complete Your Business Profile
              </h3>
              <p className="text-slate-600">
                Help us provide better recommendations by sharing basic information about your business
              </p>
            </div>
          </div>
          <Link to={createPageUrl("BusinessProfile")}>
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
              Complete Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}