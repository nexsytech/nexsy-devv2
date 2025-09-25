
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SimplifiedProduct } from "@/api/entities";
import { CreativeOutput } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  MoreVertical,
  Edit,
  Trash2,
  Rocket,
  Bot } from
"lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { toast } from 'sonner';
import { invokeOpenAI } from "@/api/functions";
import { formatDistanceToNow } from "date-fns";

const currencySymbolMap = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', CHF: 'Fr', CNY: '¥',
  SEK: 'kr', NZD: '$', INR: '₹', BRL: 'R$', RUB: '₽', KRW: '₩', SGD: '$', NOK: 'kr',
  MXN: '$', HKD: '$', TRY: '₺', ZAR: 'R', PLN: 'zł', THB: '฿', ILS: '₪', DKK: 'kr',
  AED: 'د.إ',
};

const formatPrice = (price, currency) => {
    const symbol = currencySymbolMap[currency] || currency || '$'; // Fallback to currency code itself if no symbol, then to '$'
    const formattedPrice = typeof price === 'number' ? price.toFixed(2).replace(/\.00$/, '') : price;
    return `${symbol}${formattedPrice}`;
};

const QuickAddProductModal = ({ open, setOpen, onProductAdded }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleQuickAdd = async () => {
    if (!name || !price || !image) {
      toast.error("Please fill all fields and upload an image.");
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Upload image
      const { UploadFile } = await import("@/api/integrations");
      const { file_url } = await UploadFile({ file: image });

      // 2. AI auto-fills other details
      const prompt = `Based on the product name "${name}", generate a simple 'what_is_it' description, a 'product_description', a 'problem_it_solves', and a 'target_customers' description.`;
      const schema = {
        type: "object",
        properties: {
          what_is_it: { type: "string" },
          product_description: { type: "string" },
          problem_it_solves: { type: "string" },
          target_customers: { type: "string" }
        }
      };
      const aiResponse = await invokeOpenAI({ prompt, response_json_schema: schema });
      const aiData = aiResponse.data || aiResponse;

      // 3. Create product
      const currentUser = await User.me();
      const productPayload = {
        product_name: name,
        price: parseFloat(price),
        product_image_url: file_url,
        what_is_it: aiData.what_is_it,
        product_description: aiData.product_description,
        problem_it_solves: aiData.problem_it_solves,
        target_customers: aiData.target_customers,
        main_goal: "sell_more_products",
        setup_completed: true,
        created_by: currentUser.email
      };
      await SimplifiedProduct.create(productPayload);

      toast.success("Product added with AI-powered insights!");
      onProductAdded();
      setOpen(false);
    } catch (error) {
      console.error("Quick add failed:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-electric-indigo" />
            Quick Add Product
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div>
            <label htmlFor="quick-add-image" className="block text-sm font-medium text-gray-700 mb-2">Product Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imageUrl ?
                <img src={imageUrl} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" /> :

                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="quick-add-image" className="relative cursor-pointer bg-white rounded-md font-medium text-electric-indigo hover:text-indigo-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="quick-add-image" name="quick-add-image" type="file" className="sr-only" onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
          <Button onClick={handleQuickAdd} disabled={isGenerating} className="w-full btn-primary">
            {isGenerating ? <LoadingSpinner /> : "Add Product with AI"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};

const ProductCard = ({ product, onDelete, onEdit, onView }) => {
  const getMainGoalLabel = (goal) => {
    const labels = {
      "get_more_customers": "Get more customers",
      "sell_more_products": "Sell more products/services",
      "tell_people_about_business": "Tell people about business",
      "get_more_calls": "Get more phone calls",
      "get_more_website_visits": "Get more website visits"
    };
    return labels[goal] || goal;
  };

  return (
    <Card className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm flex flex-col group h-full">
      <CardContent className="p-4 flex flex-col h-full">
        {product.product_image_url ? (
          <img
            src={product.product_image_url}
            alt={product.product_name}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading text-xl font-bold text-slate-800 line-clamp-1">{product.product_name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); console.log("[YourProducts Page] Edit button clicked for product ID:", product.id); onEdit(product.id); }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                className="text-coral-pop focus:text-white focus:bg-coral-pop"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-grow">
          <p className="text-slate-600 text-sm mb-2">{getMainGoalLabel(product.main_goal)}</p>
          <p className="text-slate-600 text-sm line-clamp-2">{product.what_is_it}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-bold text-slate-800">{formatPrice(product.price, product.currency)}</div>
        </div>

        <div className="text-xs text-slate-500 mt-3">
          Last edited {formatDistanceToNow(new Date(product.updated_date), { addSuffix: true })}
        </div>

        <Button
          className="w-full mt-4"
          style={{ backgroundColor: '#4169E1', color: 'white' }}
          onClick={(e) => {
            e.stopPropagation();
            console.log("[YourProducts Page] Manage & Launch button clicked for product ID:", product.id);
            onView(product.id);
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#3458CC'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4169E1'}
        >
          <Rocket className="w-4 h-4 mr-2" />
          Manage & Launch
        </Button>
      </CardContent>
    </Card>
  );
};

export default function YourProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      const userProducts = await SimplifiedProduct.filter({ created_by: currentUser.email }, '-updated_date');
      setProducts(userProducts || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product and all its generated content? This action cannot be undone.")) {
      return;
    }

    try {
      // Also delete related CreativeOutputs
      const creatives = await CreativeOutput.filter({ product_id: productId });
      for (const creative of creatives) {
        await CreativeOutput.delete(creative.id);
      }
      await SimplifiedProduct.delete(productId);
      toast.success("Product deleted successfully");
      loadProducts(); // Reload the list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditProduct = (productId) => {
    // FIX: Navigate to the correct edit page with the 'edit' parameter
    navigate(createPageUrl(`ProductCreativeSetup?edit=${productId}`));
  };

  const handleViewProduct = (productId) => {
    navigate(createPageUrl(`ProductDetails?id=${productId}`));
  };

  const filteredProducts = products.filter((product) =>
  (product.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (product.what_is_it || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner fullPage={true} text="Loading your products..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="w-full max-w-none mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Products</h1>
            <p className="text-slate-600">Manage your products and launch marketing campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setQuickAddModalOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            <Link to={createPageUrl("ProductCreativeSetup")}>
              <Button
                style={{ backgroundColor: '#4169E1', color: 'white' }} // Changed to proper blue
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3458CC'} // Darker blue on hover
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4169E1'} // Reset to original
              >
                <Plus className="w-5 h-5" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg" />

        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ?
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) =>
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
            onEdit={handleEditProduct}
            onView={handleViewProduct} />

          )}
          </div> :

        <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Bot className="w-12 h-12 text-electric-indigo" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-800 mb-2">
                {searchTerm ? "No products found" : "Let's add your first product!"}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchTerm ?
              `No products match "${searchTerm}". Try a different search term or add a new product.` :
              "Your marketing journey starts here. Tell me about your product, and I'll get to work."
              }
              </p>
              <Button onClick={() => setQuickAddModalOpen(true)} size="lg" className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        }

        <QuickAddProductModal
          open={quickAddModalOpen}
          setOpen={setQuickAddModalOpen}
          onProductAdded={loadProducts}
        />
      </div>
    </div>
  );
}
