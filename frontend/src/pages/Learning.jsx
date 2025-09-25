
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Target, 
  Palette, 
  TrendingUp, 
  Users, 
  DollarSign,
  Play,
  Clock,
  Star,
  BookOpen,
  Award,
  ExternalLink
} from "lucide-react";

const freeResources = [
  {
    title: "Meta Ads Manager Training",
    description: "Official Facebook/Instagram advertising certification course covering campaign setup, targeting, and optimization.",
    duration: "4 hours",
    level: "Beginner to Intermediate",
    url: "https://www.facebook.com/business/learn",
    provider: "Meta Business",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Google Ads Skillshop",
    description: "Complete Google Ads certification training including Search, Display, YouTube, and Shopping campaigns.",
    duration: "6 hours",
    level: "All Levels",
    url: "https://skillshop.exceedlms.com/student/catalog/list?category_ids=53-google-ads",
    provider: "Google",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "HubSpot Content Marketing Course",
    description: "Learn to create content that drives traffic, generates leads, and builds brand awareness.",
    duration: "3 hours",
    level: "Beginner",
    url: "https://academy.hubspot.com/courses/content-marketing",
    provider: "HubSpot Academy",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Coursera Digital Marketing Specialization",
    description: "University of Illinois comprehensive program covering SEO, social media, email marketing, and analytics.",
    duration: "8 months",
    level: "Intermediate to Advanced",
    url: "https://www.coursera.org/specializations/digital-marketing",
    provider: "University of Illinois",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Moz SEO Learning Center",
    description: "Free comprehensive guides and tutorials on search engine optimization and local SEO.",
    duration: "Self-paced",
    level: "All Levels",
    url: "https://moz.com/learn/seo",
    provider: "Moz",
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Buffer Social Media Marketing Course",
    description: "Complete guide to social media strategy, content creation, and community management.",
    duration: "2 hours",
    level: "Beginner",
    url: "https://buffer.com/resources/social-media-marketing-courses/",
    provider: "Buffer",
    color: "from-teal-500 to-cyan-500"
  }
];

const quickTips = [
  {
    icon: Target,
    title: "Audience Targeting",
    tip: "Start broad with your targeting, then narrow down based on performance data. Facebook's algorithm needs data to optimize."
  },
  {
    icon: Palette,
    title: "Creative Testing",
    tip: "Test 3-5 different ad creatives at launch. Images with people performing the desired action typically perform 20% better."
  },
  {
    icon: TrendingUp,
    title: "Budget Optimization",
    tip: "Use Campaign Budget Optimization (CBO) for campaigns with multiple ad sets. Let Facebook distribute budget to top performers."
  },
  {
    icon: DollarSign,
    title: "Cost Control",
    tip: "Set a cost cap rather than a bid cap for more predictable costs. Start with 1.5x your target CPA."
  }
];

const levelColors = {
  "Beginner": "bg-green-100 text-green-800 border-green-200",
  "Intermediate": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Advanced": "bg-red-100 text-red-800 border-red-200",
  "All Levels": "bg-blue-100 text-blue-800 border-blue-200",
  "Beginner to Intermediate": "bg-orange-100 text-orange-800 border-orange-200",
  "Intermediate to Advanced": "bg-purple-100 text-purple-800 border-purple-200"
};

export default function Learning() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-none mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Learning Hub</h1>
              <p className="text-slate-600">Master digital marketing with expert-curated free resources</p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Pro Tips from Marketing Experts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                  <tip.icon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{tip.title}</h4>
                    <p className="text-sm text-slate-600">{tip.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Free Resources */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Free Certification Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeResources.map((resource, index) => (
              <Card key={index} className="flex flex-col border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${resource.color} flex items-center justify-center`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={`${levelColors[resource.level]} border text-xs`}>
                      {resource.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">{resource.provider}</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 my-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-auto bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Recommended Learning Path for Beginners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Start with HubSpot Content Marketing</h4>
                  <p className="text-sm text-slate-600">Learn the fundamentals of creating valuable content that attracts customers</p>
                </div>
                <Badge variant="outline">2 hours</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Master Meta Ads Manager</h4>
                  <p className="text-sm text-slate-600">Get certified in Facebook and Instagram advertising</p>
                </div>
                <Badge variant="outline">4 hours</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Get Google Ads Certified</h4>
                  <p className="text-sm text-slate-600">Learn search and display advertising on Google's platform</p>
                </div>
                <Badge variant="outline">6 hours</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Learn SEO Fundamentals</h4>
                  <p className="text-sm text-slate-600">Understand organic search optimization with Moz's free resources</p>
                </div>
                <Badge variant="outline">Self-paced</Badge>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 mb-4">
                Complete this path to build a solid foundation in digital marketing. All courses are free and offer certificates.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                onClick={() => window.open('https://academy.hubspot.com/courses/content-marketing', '_blank')}
              >
                Start Learning Path
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
