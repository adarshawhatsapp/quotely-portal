
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";

// Mock quotation data (would fetch from API in real app)
const mockQuotation = {
  id: "Q-2023-001",
  customerName: "Acme Corporation",
  customerEmail: "procurement@acmecorp.com",
  customerPhone: "+91 98765 43210",
  customerAddress: "123 Business Park, Mumbai, Maharashtra, 400001",
  subtotal: 124500,
  gst: 22410,
  total: 146910,
  status: "Approved",
  createdAt: "2023-06-10T10:30:00",
  products: [
    {
      id: "1",
      name: "Crystal Chandelier",
      modelNumber: "CC-2023-01",
      quantity: 1,
      price: 45000,
      discountedPrice: 39999,
      customization: "Gold finish",
      total: 39999
    },
    {
      id: "2",
      name: "Modern Pendant Light",
      modelNumber: "PL-2023-42",
      quantity: 3,
      price: 12500,
      discountedPrice: 10999,
      customization: "Black",
      total: 32997
    },
    {
      id: "4",
      name: "LED Ceiling Fixture",
      modelNumber: "LC-2023-08",
      quantity: 2,
      price: 18500,
      discountedPrice: 16499,
      customization: "Dimmable",
      total: 32998
    },
    {
      id: "SP002",
      name: "LED Bulb (Warm White)",
      modelNumber: "Spare Parts",
      quantity: 50,
      price: 350,
      discountedPrice: 350,
      customization: "",
      total: 17500
    },
    {
      id: "SP007",
      name: "Dimmer Switch",
      modelNumber: "Spare Parts",
      quantity: 2,
      price: 750,
      discountedPrice: 503,
      customization: "",
      total: 1006
    }
  ]
};

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
  // In a real app, you'd fetch the quotation data using the ID
  const [quotation, setQuotation] = useState(mockQuotation);

  const handleApprove = () => {
    setQuotation({...quotation, status: "Approved"});
    toast.success("Quotation has been approved");
  };

  const handleReject = () => {
    setQuotation({...quotation, status: "Rejected"});
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
            Quotation {id}
          </h1>
          <Badge className={getStatusColor(quotation.status)}>
            {quotation.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {quotation.status === "Pending" && (
            <>
              <Button 
                variant="outline" 
                className="gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleReject}
              >
                <X className="h-4 w-4" />
                <span>Reject</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-1 text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                onClick={handleApprove}
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
                <div className="font-medium">{quotation.customerName}</div>
                <div className="text-sm mt-1">
                  <div>{quotation.customerEmail}</div>
                  <div>{quotation.customerPhone}</div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h4>
                <div className="text-sm whitespace-pre-line">{quotation.customerAddress}</div>
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
                {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(quotation.createdAt).toLocaleTimeString()}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Items</h4>
              <div className="font-medium">{quotation.products.length} products</div>
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
                {quotation.products.map((product, index) => (
                  <tr key={product.id} className="border-b last:border-0">
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
