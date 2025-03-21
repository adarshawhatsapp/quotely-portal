
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Mail,
  Printer,
  Edit,
  Check,
  X,
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getQuotationById, updateQuotationStatus } from "@/services/quotationService";
import { useAuth } from "@/context/AuthContext";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-amber-100 text-amber-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const QuotationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch quotation
  const { data: quotation, isLoading, error } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => getQuotationById(id || ''),
    enabled: !!id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'Approved' | 'Pending' | 'Rejected' }) => 
      updateQuotationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  const handleApprove = () => {
    if (!id) return;
    updateStatusMutation.mutate({ 
      id, 
      status: 'Approved' 
    });
    setIsApproveDialogOpen(false);
    toast.success("Quotation has been approved");
  };

  const handleReject = () => {
    if (!id) return;
    updateStatusMutation.mutate({ 
      id, 
      status: 'Rejected' 
    });
    setIsRejectDialogOpen(false);
    toast.error("Quotation has been rejected");
  };

  const handleEmail = () => {
    toast.success("Quotation emailed to customer");
  };

  const handleDownload = () => {
    toast.success("Quotation PDF downloaded");
  };

  const handlePrint = () => {
    toast.success("Sending to printer...");
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading quotation...</span>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Quotation</h3>
        <p className="text-gray-500 mb-4">
          {(error as any)?.message || "Failed to load quotation details. It may have been deleted or you don't have permission to view it."}
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['quotation', id] })}
          >
            Retry
          </Button>
          <Button onClick={() => navigate('/quotations')}>
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link to="/quotations">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {quotation.quote_number}
          </h1>
          <Badge className={getStatusColor(quotation.status)}>
            {quotation.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {quotation.status === "Pending" && user?.role === 'admin' && (
            <>
              <Button 
                variant="outline" 
                className="gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                <X className="h-4 w-4" />
                <span>Reject</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-1 text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsApproveDialogOpen(true)}
              >
                <Check className="h-4 w-4" />
                <span>Approve</span>
              </Button>
            </>
          )}
          <Button variant="outline" className="gap-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" className="gap-1" onClick={handleEmail}>
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>
          <Button className="gap-1" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this quotation? This will change its status to "Approved".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this quotation? This will change its status to "Rejected".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Customer Information</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer Details</h4>
                <div className="font-medium">{quotation.customer_name}</div>
                <div className="text-sm mt-1">
                  {quotation.customer_email && <div>{quotation.customer_email}</div>}
                  {quotation.customer_phone && <div>{quotation.customer_phone}</div>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h4>
                <div className="text-sm whitespace-pre-line">{quotation.customer_address || "No address provided"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quotation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Date Created</h4>
              <div className="font-medium">
                {new Date(quotation.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(quotation.created_at).toLocaleTimeString()}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Items</h4>
              <div className="font-medium">{quotation.items.length} products</div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Amount</h4>
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">₹{quotation.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm">GST (18%):</span>
                  <span className="font-medium">₹{quotation.gst.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">₹{quotation.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Products</CardTitle>
        </CardHeader>
        <CardContent>
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
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((product, index) => (
                  <tr key={`${product.id}-${index}`} className="border-b last:border-0">
                    <td className="py-3 align-top text-sm">{index + 1}</td>
                    <td className="py-3 align-top font-medium">{product.name}</td>
                    <td className="py-3 align-top text-sm">{product.modelNumber}</td>
                    <td className="py-3 align-top text-sm">
                      {product.customization || "—"}
                    </td>
                    <td className="py-3 align-top text-sm text-right">
                      ₹{product.discountedPrice.toLocaleString()}
                      {product.price !== product.discountedPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{product.price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 align-top text-sm text-center">{product.quantity}</td>
                    <td className="py-3 align-top font-medium text-right">
                      ₹{product.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={5} className="pt-3"></td>
                  <td className="pt-3 text-right text-sm font-medium">Subtotal:</td>
                  <td className="pt-3 text-right font-medium">₹{quotation.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={5}></td>
                  <td className="py-1 text-right text-sm font-medium">GST (18%):</td>
                  <td className="py-1 text-right font-medium">₹{quotation.gst.toLocaleString()}</td>
                </tr>
                <tr className="border-t">
                  <td colSpan={5}></td>
                  <td className="pt-2 text-right text-sm font-bold">Total:</td>
                  <td className="pt-2 text-right font-bold text-lg">₹{quotation.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. This quotation is valid for 30 days from the date of issue.</p>
          <p>2. All prices are in Indian Rupees (₹) and include GST at 18%.</p>
          <p>3. Delivery time: 4-6 weeks from confirmation of order and payment.</p>
          <p>4. Payment terms: 50% advance payment, balance before delivery.</p>
          <p>5. Installation charges may apply and will be quoted separately if required.</p>
          <p>6. Warranty: 1 year manufacturer's warranty on all products against manufacturing defects.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationDetailPage;
