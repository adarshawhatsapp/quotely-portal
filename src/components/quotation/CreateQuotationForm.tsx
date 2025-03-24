
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { toast } from "sonner";
import {
  ShoppingCart,
  User,
  FileText,
  CheckCircle,
  Loader2,
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download
} from "lucide-react";
import { 
  createQuotation, 
  updateQuotation, 
  getQuotationById, 
  CustomerInfo, 
  QuoteItem 
} from "@/services/quotationService";
import ProductSelector from "./ProductSelector";
import QuotationItemCard from "./QuotationItemCard";
import { generatePDF } from "@/utils/quotationUtils";

const calculateTotals = (items: QuoteItem[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  
  return { subtotal, gst, total };
};

const CreateQuotationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  
  // Fetch quotation data if in edit mode
  const { data: quotationData, isLoading: isLoadingQuotation } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => getQuotationById(id || ''),
    enabled: isEditMode,
    onSuccess: (data) => {
      setQuoteItems(data.items);
      setCustomerInfo({
        name: data.customer_name,
        email: data.customer_email || "",
        phone: data.customer_phone || "",
        address: data.customer_address || ""
      });
    },
    onError: (error) => {
      console.error("Error fetching quotation:", error);
      toast.error("Failed to load quotation data");
      navigate("/quotations");
    }
  });
  
  const { subtotal, gst, total } = calculateTotals(quoteItems);

  // Handle adding a new item to the quote
  const handleAddItem = (item: QuoteItem) => {
    setQuoteItems([...quoteItems, item]);
    toast.success(`${item.name} added to quote`);
  };
  
  // Handle removing an item from the quote
  const handleRemoveItem = (indexToRemove: number) => {
    const itemName = quoteItems[indexToRemove].name;
    setQuoteItems(quoteItems.filter((_, index) => index !== indexToRemove));
    toast.info(`${itemName} removed from quote`);
  };
  
  // Handle updating an item's quantity
  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...quoteItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = updatedItems[index].discountedPrice * quantity;
    
    setQuoteItems(updatedItems);
  };
  
  // Handle updating an item's discounted price
  const handleUpdateItemDiscount = (index: number, discountedPrice: number) => {
    const updatedItems = [...quoteItems];
    updatedItems[index].discountedPrice = discountedPrice;
    updatedItems[index].total = discountedPrice * updatedItems[index].quantity;
    
    setQuoteItems(updatedItems);
    toast.success(`Discount applied to ${updatedItems[index].name}`);
  };

  // Handle updating an item's area
  const handleUpdateItemArea = (index: number, area: string) => {
    const updatedItems = [...quoteItems];
    updatedItems[index].area = area;
    
    setQuoteItems(updatedItems);
    toast.success(`Area updated for ${updatedItems[index].name}`);
  };

  // Handle navigation between steps
  const handleNextStep = () => {
    if (currentStep === 1 && quoteItems.length === 0) {
      toast.error("Please add at least one item to the quote");
      return;
    }
    
    if (currentStep === 2) {
      // Validate customer info
      if (!customerInfo.name || !customerInfo.phone) {
        toast.error("Please fill in customer name and phone number");
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Handle creating or updating the quote
  const handleSaveQuote = async () => {
    try {
      setIsSubmitting(true);
      
      console.log("Saving quotation with items:", quoteItems);
      console.log("Customer info:", customerInfo);
      console.log("Financial details:", { subtotal, gst, total });
      
      let quotation;
      
      if (isEditMode) {
        // Update existing quotation
        quotation = await updateQuotation(
          id!,
          quoteItems,
          customerInfo,
          subtotal,
          gst,
          total
        );
        toast.success("Quotation updated successfully!");
      } else {
        // Create new quotation
        quotation = await createQuotation(
          quoteItems,
          customerInfo,
          subtotal,
          gst,
          total
        );
        toast.success("Quotation created successfully!");
      }
      
      // Navigate to the quotation
      setTimeout(() => {
        navigate(`/quotations/${quotation.id}`);
      }, 1000);
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} quotation: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    setIsPdfGenerating(true);
    
    try {
      // Need to save the quotation first
      const tempQuotation = isEditMode 
        ? await updateQuotation(id!, quoteItems, customerInfo, subtotal, gst, total) 
        : await createQuotation(quoteItems, customerInfo, subtotal, gst, total);
        
      // Then navigate to view it and trigger PDF download
      navigate(`/quotations/${tempQuotation.id}`);
      
      setTimeout(async () => {
        await generatePDF();
        setIsPdfGenerating(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      setIsPdfGenerating(false);
    }
  };

  // Loading state
  if (isEditMode && isLoadingQuotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading quotation data...</span>
      </div>
    );
  }

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Select Products
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold">Select Products and Spares</h2>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsAddItemDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>
            
            {/* Products List */}
            {quoteItems.length > 0 ? (
              <div className="space-y-3">
                {quoteItems.map((item, index) => (
                  <QuotationItemCard
                    key={`${item.id}-${index}`}
                    item={item}
                    index={index}
                    onUpdateQuantity={handleUpdateItemQuantity}
                    onUpdateDiscount={handleUpdateItemDiscount}
                    onUpdateArea={handleUpdateItemArea}
                    onRemove={handleRemoveItem}
                  />
                ))}
                
                {/* Totals */}
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">GST (18%):</span>
                        <span className="font-medium">₹{gst.toLocaleString()}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No items added yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Start by adding products or spare parts to your quotation. You can customize quantities and prices for each item.
                  </p>
                  <Button 
                    onClick={() => setIsAddItemDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Item</span>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Product Selector Dialog */}
            <ProductSelector
              open={isAddItemDialogOpen}
              onClose={() => setIsAddItemDialogOpen(false)}
              onAddItem={handleAddItem}
            />
          </div>
        );
        
      case 2: // Customer Information
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
                    <Label htmlFor="customer-name">Full Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="customer-name" 
                      placeholder="John Smith"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input 
                      id="customer-phone" 
                      placeholder="+91 98765 43210"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
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
          </div>
        );
      
      case 3: // Review
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review & Finalize Quotation</h2>
            
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
                        <div>{customerInfo.phone}</div>
                        {customerInfo.email && <div>{customerInfo.email}</div>}
                      </div>
                    </div>
                    {customerInfo.address && (
                      <div>
                        <div className="font-medium">Shipping Address</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {customerInfo.address}
                        </div>
                      </div>
                    )}
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
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} × ₹{item.discountedPrice.toLocaleString()}
                            {item.price !== item.discountedPrice && (
                              <span className="text-green-600 ml-2">
                                ({((1 - item.discountedPrice / item.price) * 100).toFixed(0)}% off)
                              </span>
                            )}
                            {item.area && (
                              <span className="ml-2">• {item.area}</span>
                            )}
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
            
            <div className="flex justify-end">
              <Button 
                variant="outline"
                className="gap-2 mr-2"
                onClick={handleGeneratePDF}
                disabled={isPdfGenerating || isSubmitting}
              >
                {isPdfGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Quotation' : 'Create Quotation'}
        </h1>
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
                <span className="text-sm font-medium">Review & Finalize</span>
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
            onClick={handleSaveQuote}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>{isEditMode ? 'Update Quotation' : 'Create Quotation'}</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateQuotationForm;
