
import React from "react";
import { Quotation } from "@/services/quotationService";
import { termsAndConditions, numberToWords } from "@/utils/quotationUtils";
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

interface PrintableQuotationProps {
  quotation: Quotation;
}

const PrintableQuotation: React.FC<PrintableQuotationProps> = ({ quotation }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  return (
    <div id="quotation-print-container" className="bg-white p-8 w-[210mm] mx-auto text-black font-sans">
      {/* Header with logo and company info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <div className="flex items-center">
            {quotation.company_details.logo && (
              <img 
                src={quotation.company_details.logo}
                alt="Magnific Logo" 
                className="h-16 object-contain mb-2"
              />
            )}
          </div>
          <h1 className="text-xl font-bold">{quotation.company_details.name}</h1>
          <p className="text-sm mt-1">{quotation.company_details.address}</p>
          <p className="text-sm">Tel: {quotation.company_details.phone}</p>
          <p className="text-sm">Email: {quotation.company_details.email}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Quotation</h2>
          <p className="font-medium text-sm">Estimate No: {quotation.quote_number}</p>
          <p className="font-medium text-sm">Date: {formatDate(quotation.created_at)}</p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6 border p-3 bg-gray-50 rounded">
        <p className="font-bold">TO: {quotation.customer_name}</p>
        {quotation.customer_phone && <p className="text-sm">Contact: {quotation.customer_phone}</p>}
        {quotation.customer_email && <p className="text-sm">Email: {quotation.customer_email}</p>}
        {quotation.customer_address && <p className="text-sm">Address: {quotation.customer_address}</p>}
      </div>

      {/* Products table */}
      <Table className="w-full border-collapse mb-6 text-sm">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="border border-gray-300 p-2 text-left font-bold">S.No.</TableHead>
            <TableHead className="border border-gray-300 p-2 text-center font-bold w-20">MODEL IMAGE</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">MODEL NAME</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">TECHNICAL DETAILS</TableHead>
            <TableHead className="border border-gray-300 p-2 text-center font-bold">Qty</TableHead>
            <TableHead className="border border-gray-300 p-2 text-right font-bold">L.PRICE</TableHead>
            <TableHead className="border border-gray-300 p-2 text-right font-bold">AFTER DISCOUNT</TableHead>
            <TableHead className="border border-gray-300 p-2 text-right font-bold">TOTAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotation.items.map((item, index) => (
            <TableRow key={`${item.id}-${index}`} className="border-b">
              <TableCell className="border border-gray-300 p-2 text-center font-medium">{index + 1}</TableCell>
              <TableCell className="border border-gray-300 p-2 text-center">
                {item.image ? (
                  <div className="w-20 h-20 overflow-hidden mx-auto">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mx-auto">
                    No image
                  </div>
                )}
              </TableCell>
              <TableCell className="border border-gray-300 p-2 font-medium">
                {item.name}
                {item.modelNumber && <div className="text-xs">{item.modelNumber}</div>}
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-xs" style={{ maxWidth: "200px", wordWrap: "break-word" }}>
                <div className="whitespace-pre-line">{item.description || item.customization || "—"}</div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center">{item.quantity}</TableCell>
              <TableCell className="border border-gray-300 p-2 text-right">₹{item.price.toLocaleString()}</TableCell>
              <TableCell className="border border-gray-300 p-2 text-right">
                ₹{item.discountedPrice.toLocaleString()}
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-right font-medium">
                ₹{item.total.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={6} className="border border-gray-300 p-2"></TableCell>
            <TableCell className="border border-gray-300 p-2 text-right font-medium">Subtotal</TableCell>
            <TableCell className="border border-gray-300 p-2 text-right font-medium">₹{quotation.subtotal.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6} className="border border-gray-300 p-2"></TableCell>
            <TableCell className="border border-gray-300 p-2 text-right font-medium">GST @18%</TableCell>
            <TableCell className="border border-gray-300 p-2 text-right font-medium">₹{quotation.gst.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow className="bg-gray-100">
            <TableCell colSpan={6} className="border border-gray-300 p-2"></TableCell>
            <TableCell className="border border-gray-300 p-2 text-right font-bold">Total</TableCell>
            <TableCell className="border border-gray-300 p-2 text-right font-bold">₹{quotation.total.toLocaleString()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Amount in words */}
      <div className="mb-4 border-t pt-2">
        <p className="text-sm font-medium">
          Amount: {numberToWords(quotation.total)} only
        </p>
      </div>

      {/* Payment details */}
      <div className="mb-4 border p-3 bg-gray-50 rounded text-sm">
        <h3 className="font-bold mb-1">RTGS Details:</h3>
        <p>
          <span className="font-medium">Company name:</span> {quotation.company_details.name}<br />
          <span className="font-medium">Bank Name:</span> {quotation.company_details.bank_name}<br />
          <span className="font-medium">A/C No.:</span> {quotation.company_details.account_no}<br />
          <span className="font-medium">Branch:</span> Koramangala<br />
          <span className="font-medium">IFSC Code:</span> {quotation.company_details.ifsc_code}
        </p>
      </div>

      {/* Terms and conditions */}
      <div className="mb-6 text-xs">
        <h3 className="font-bold mb-2 text-sm">Terms & Conditions</h3>
        <ol className="list-decimal pl-5 space-y-1">
          {termsAndConditions.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center">
        <p className="text-xs text-gray-500">This is an electronically generated Quotation and does not require a signature.</p>
        <p className="font-medium text-blue-600 mt-1">{quotation.company_details.website}</p>
      </div>
    </div>
  );
};

export default PrintableQuotation;
