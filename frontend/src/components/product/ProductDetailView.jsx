import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Users, DollarSign, Target, Megaphone, Calendar, MapPin, Tag } from "lucide-react";

const DetailSection = ({ icon: Icon, title, children }) => (
    <div>
        <div className="flex items-center gap-3 mb-2">
            <Icon className="w-5 h-5 text-slate-500" />
            <h3 className="text-md font-semibold text-slate-700">{title}</h3>
        </div>
        <div className="pl-8 text-sm text-slate-600 space-y-1">
            {children}
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    value ? <p><strong className="font-medium text-slate-800">{label}:</strong> {value}</p> : null
);

export default function ProductDetailView({ product }) {
    if (!product) return null;

    return (
        <div className="space-y-6 p-2">
            <CardHeader className="p-0">
                <CardTitle className="text-2xl font-heading">{product.product_name}</CardTitle>
                <p className="text-slate-500">{product.unique_selling_proposition}</p>
            </CardHeader>
            <Separator />
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <DetailSection icon={Package} title="Core Details">
                    <InfoItem label="Category" value={product.product_category?.replace(/_/g, ' ')} />
                    <InfoItem label="Description" value={product.product_description} />
                </DetailSection>

                <DetailSection icon={DollarSign} title="Pricing">
                    <InfoItem label="Price" value={product.product_price ? `$${product.product_price}` : 'Not specified'} />
                </DetailSection>
                
                <DetailSection icon={Users} title="Target Audience">
                    <InfoItem label="Ideal Customer" value={product.target_customer_description} />
                    <InfoItem label="Age Range" value={product.customer_age_range?.join(', ')?.replace(/_/g, '-')} />
                    <InfoItem label="Country" value={product.customer_country} />
                    <InfoItem label="State/Province" value={product.customer_state} />
                    <InfoItem label="City" value={product.customer_city} />
                    <InfoItem label="Pain Points" value={product.customer_pain_points} />
                </DetailSection>

                <DetailSection icon={Tag} title="Customer Interests">
                     <div>
                        {product.customer_interests?.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {product.customer_interests.map(g => <Badge key={g} variant="secondary">{g.replace(/_/g, ' ')}</Badge>)}
                            </div>
                        ) : " None specified"}
                    </div>
                </DetailSection>


                {product.product_images?.length > 0 && (
                    <div className="md:col-span-2">
                        <DetailSection icon={Package} title="Product Images">
                             <div className="flex flex-wrap gap-2 mt-2">
                                {product.product_images.map((url, index) => (
                                    <img key={index} src={url} alt={`Product ${index + 1}`} className="w-24 h-24 object-cover rounded-md border" />
                                ))}
                            </div>
                        </DetailSection>
                    </div>
                )}
            </div>
        </div>
    );
}