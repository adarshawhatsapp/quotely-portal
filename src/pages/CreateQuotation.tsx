import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import { getSpares } from "@/services/spareService";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Trash,
  ChevronDown,
  ArrowRight,
  ArrowLeft,  
  Save,
  ShoppingCart,
  ChevronRight,
  User,
  FileText,
  CheckCircle
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";







type QuoteItem = {
  id: string;
  name: string;
  model_number: string;
  quantity: number;
  price: number;
  discounted_price: number;
  customization: string;
  total: number;
};

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
}

  
const calculateTotals = (items: QuoteItem[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  
  return { subtotal, gst, total };
};

const CreateQuotationPage = () => {
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomization, setSelectedCustomization] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  
  
  


  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  
  const { subtotal, gst, total } = calculateTotals(quoteItems);

 // Fetch products and spares from Supabase
 const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
  queryKey: ['products'],
  queryFn: getProducts,
});

const { data: spares = [], isLoading: isLoadingSpares, error: sparesError } = useQuery({
  queryKey: ['spares'],
  queryFn: getSpares,
});

// Handle loading and errors
if (isLoadingProducts || isLoadingSpares) {
  return (
    <div className="flex items-center justify-center h-64">
      
      <span className="ml-2">Loading products and spares...</span>
    </div>
  );
}

if (productsError || sparesError) {
  return (
    <div className="p-8 text-center">
      <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Data</h3>
      <p className="text-gray-500">{productsError?.message || sparesError?.message}</p>
      <Button onClick={() => {
        queryClient.invalidateQueries(['products']);
        queryClient.invalidateQueries(['spares']);
      }}>Retry</Button>
    </div>
  );
}

// Filter products and spares based on search query
const filteredProducts = products.filter(product => 
  product.name.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredSpares = spares.filter(spare => 
  spare.name.toLowerCase().includes(searchQuery.toLowerCase())
);

  const handleAddToQuote = () => {
    if (!selectedProduct) return;
    
    const newItem: QuoteItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      model_number: selectedProduct.model_number,
      quantity: quantity,
      price: selectedProduct.price,
      discounted_price: selectedProduct.discounted_price,
      customization: selectedCustomization,
      total: selectedProduct.discounted_price * quantity
    };
    
    setQuoteItems([...quoteItems, newItem]);
    
    // Reset state
    setSelectedProduct(null);
    setSelectedCustomization("");
    setQuantity(1);
    setIsAddItemDialogOpen(false);
    
    toast.success(`${selectedProduct.name} added to quote`);
  };
  
  const handleRemoveItem = (indexToRemove: number) => {
    const itemName = quoteItems[indexToRemove].name;
    setQuoteItems(quoteItems.filter((_, index) => index !== indexToRemove));
    toast.info(`${itemName} removed from quote`);
  };
  
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedCustomization(product.customizations && product.customizations.length > 0 ? product.customizations[0] : "");
  };
  
  const handleUpdateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...quoteItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].discounted_price * newQuantity;
    
    setQuoteItems(updatedItems);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && quoteItems.length === 0) {
      toast.error("Please add at least one item to the quote");
      return;
    }
    
    if (currentStep === 2) {
      // Validate customer info
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
        toast.error("Please fill in all customer information");
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleCreateQuote = () => {
    // In a real app, this would send the data to the server
    toast.success("Quotation created successfully!");
    
    // Generate a new quotation ID
    const newQuoteId = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Navigate to the new quotation
    setTimeout(() => {
      navigate(`/quotations/${newQuoteId}`);
    }, 1000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold">Select Products and Spares</h2>
              <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add Item to Quotation</DialogTitle>
                    <DialogDescription>
                      Search and select products or spare parts to add to your quotation.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 my-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products or spares..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    {/* Tabs for Products vs Spares */}
                    <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="spares">Spare Parts</TabsTrigger>
                      </TabsList>
                      
                      {/* Products Tab */}
                      <TabsContent value="products" className="space-y-4 pt-2">
                        <div className="grid gap-4 md:grid-cols-2">
                          {filteredProducts.map((product) => (
                            <div 
                              key={product.id}
                              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedProduct?.id === product.id 
                                  ? "border-primary bg-primary/5" 
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => handleSelectProduct(product)}
                            >
                              <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.model_number}</div>
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="font-medium">₹{product?.price ? product.price.toLocaleString() : "N/A"}</span>
                                  {product.price !== product.discounted_price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ₹{product.price.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {filteredProducts.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No products match your search
                          </div>
                        )}
                      </TabsContent>
                      
                      {/* Spares Tab */}
                      <TabsContent value="spares" className="space-y-4 pt-2">
                        <div className="grid gap-4 md:grid-cols-2">
                          {filteredSpares.map((spare) => (
                            <div 
                              key={spare.id}
                              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedProduct?.id === spare.id 
                                  ? "border-primary bg-primary/5" 
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => handleSelectProduct(spare)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{spare.name}</div>
                                <div className="text-xs text-muted-foreground">{spare.id}</div>
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="font-medium">₹{spare.price.toLocaleString()}</span>
                                  {spare.price !== spare.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ₹{spare.price.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  In Stock: {spare.stock}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {filteredSpares.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No spare parts match your search
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    
                    {/* Item Details Section (visible when product is selected) */}
                    {selectedProduct && (
                      <div className="pt-4 border-t space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{selectedProduct.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{selectedProduct.model_number}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₹{ selectedProduct?.discounted_price? selectedProduct.discounted_price.toLocaleString(): "N/A"}</div>
                            {selectedProduct.price !== selectedProduct.discounted_price && (
                              <div className="text-xs text-muted-foreground line-through">
                                ₹{selectedProduct.price.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {selectedProduct.customizations && selectedProduct.customizations.length > 0 && (
                            <div className="space-y-2">
                              <Label htmlFor="customization">Customization</Label>
                              <Select
                                value={selectedCustomization}
                                onValueChange={setSelectedCustomization}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customization" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedProduct.customizations.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <div className="flex items-center">
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-r-none"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              >
                                -
                              </Button>
                              <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="h-9 rounded-none text-center w-16"
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-l-none"
                                onClick={() => setQuantity(quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-medium">Total</span>
                          <span className="text-lg font-bold">
                            ₹{(selectedProduct.discounted_price * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddItemDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddToQuote}
                      disabled={!selectedProduct}
                    >
                      Add to Quote
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Quote Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Items</CardTitle>
                <CardDescription>Items added to this quotation</CardDescription>
              </CardHeader>
              <CardContent>
                {quoteItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium text-sm text-muted-foreground w-12">No.</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground">Product</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground">Model</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground">Customization</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground text-right">Price</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground text-center">Qty</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground text-right">Total</th>
                          <th className="pb-2 font-medium text-sm text-muted-foreground w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteItems.map((item, index) => (
                          <tr key={`${item.id}-${index}`} className="border-b last:border-0">
                            <td className="py-3 align-top text-sm">{index + 1}</td>
                            <td className="py-3 align-top font-medium">{item.name}</td>
                            <td className="py-3 align-top text-sm">{item.model_number}</td>
                            <td className="py-3 align-top text-sm">
                              {item.customization || "—"}
                            </td>
                            <td className="py-3 align-top text-sm text-right">
                              ₹{item?.discounted_price ?  item.discounted_price.toLocaleString() : "N/A"}
                              {item.price !== item.discounted_price && (
                                <div className="text-xs text-muted-foreground line-through">
                                  ₹{item?.price ? item.price.toLocaleString(): "N/A"}
                                </div>
                              )}
                            </td>
                            <td className="py-3 align-top text-sm text-center">
                              <div className="flex items-center justify-center">
                                <Button 
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button 
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 align-top font-medium text-right">
                              ₹{item.total.toLocaleString()}
                            </td>
                            <td className="py-3 align-top">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t">
                          <td colSpan={5} className="pt-3"></td>
                          <td className="pt-3 text-right text-sm font-medium">Subtotal:</td>
                          <td className="pt-3 text-right font-medium">₹{subtotal.toLocaleString()}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={5}></td>
                          <td className="py-1 text-right text-sm font-medium">GST (18%):</td>
                          <td className="py-1 text-right font-medium">₹{gst.toLocaleString()}</td>
                          <td></td>
                        </tr>
                        <tr className="border-t">
                          <td colSpan={5}></td>
                          <td className="pt-2 text-right text-sm font-bold">Total:</td>
                          <td className="pt-2 text-right font-bold text-lg">₹{total.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No items added yet</h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                      Click the "Add Item" button to add products or spare parts to your quotation.
                    </p>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => setIsAddItemDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Item</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Customer Information</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>Enter customer information for the quotation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Full Name</Label>
                    <Input 
                      id="customer-name" 
                      placeholder="John Smith"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input 
                      id="customer-email" 
                      type="email"
                      placeholder="john@example.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <Input 
                      id="customer-phone" 
                      placeholder="+91 98765 43210"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-address">Shipping Address</Label>
                  <Textarea 
                    id="customer-address" 
                    placeholder="123 Business Park, Mumbai, Maharashtra, 400001"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Quote summary for reference */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span>Items:</span>
                  <span>{quoteItems.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>GST (18%):</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Quotation</h2>
            
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Customer Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">{customerInfo.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>{customerInfo.email}</div>
                        <div>{customerInfo.phone}</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Shipping Address</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {customerInfo.address}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Items Summary */}
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Items ({quoteItems.length})</h3>
                  <div className="space-y-2">
                    {quoteItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">
                            {item.name}
                            {item.customization && (
                              <Badge variant="outline" className="ml-2 font-normal text-xs">
                                {item.customization}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} x ₹{item.discounted_price.toLocaleString()}
                          </div>
                        </div>
                        <div className="font-medium">₹{item.total.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Payment Summary */}
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span>₹{gst.toLocaleString()}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Terms & Conditions */}
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Terms & Conditions</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• This quotation is valid for 30 days from the date of issue.</li>
                    <li>• All prices are in Indian Rupees (₹) and include GST at 18%.</li>
                    <li>• Delivery time: 4-6 weeks from confirmation of order and payment.</li>
                    <li>• Payment terms: 50% advance payment, balance before delivery.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 border-t flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Created on {new Date().toLocaleDateString()}
                </div>
                <div className="text-sm font-medium">
                  Total: ₹{total.toLocaleString()}
                </div>
              </CardFooter>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Create Quotation</h1>
      </div>
      
      {/* Step Indicator */}
      <div className="flex justify-between">
        <Card className="w-full overflow-hidden">
          <CardContent className="p-0">
            <div className="flex justify-between">
              <div 
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center py-4 ${
                  currentStep >= 1 ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <ShoppingCart className="h-5 w-5 mb-1 sm:mb-0 sm:mr-2" />
                <span className="text-sm font-medium">Select Items</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground self-center hidden sm:block" />
              <div 
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center py-4 ${
                  currentStep >= 2 ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <User className="h-5 w-5 mb-1 sm:mb-0 sm:mr-2" />
                <span className="text-sm font-medium">Customer Info</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground self-center hidden sm:block" />
              <div 
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center py-4 ${
                  currentStep >= 3 ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <FileText className="h-5 w-5 mb-1 sm:mb-0 sm:mr-2" />
                <span className="text-sm font-medium">Review & Create</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Step Content */}
      {renderStepContent()}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handlePrevStep}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Step</span>
          </Button>
        ) : (
          <div></div>
        )}
        
        {currentStep < 3 ? (
          <Button 
            className="gap-2"
            onClick={handleNextStep}
          >
            <span>Next Step</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="gap-2"
            onClick={handleCreateQuote}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Create Quotation</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateQuotationPage;
