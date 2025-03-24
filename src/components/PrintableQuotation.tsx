
import React from "react";
import { Quotation } from "@/services/quotationService";
import { termsAndConditions, numberToWords } from "@/utils/quotationUtils";

interface PrintableQuotationProps {
  quotation: Quotation;
}

const PrintableQuotation: React.FC<PrintableQuotationProps> = ({ quotation }) => {
  return (
    <div id="quotation-print-container" className="bg-white p-8 rounded-lg shadow print:shadow-none max-w-4xl mx-auto">
      {/* Header with company info and logo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-6">
        <div className="text-left mb-4 md:mb-0">
          <h2 className="text-xl font-bold">{quotation.company_details.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bank: {quotation.company_details.bank_name}<br />
            Account No: {quotation.company_details.account_no}<br />
            IFSC: {quotation.company_details.ifsc_code}
          </p>
        </div>
        <div className="flex-shrink-0">
          {quotation.company_details.logo && (
            <img 
              src={quotation.company_details.logo} 
              alt="Company Logo" 
              className="h-16 object-contain"
            />
          )}
        </div>
      </div>

      {/* Quotation title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Quotation</h1>
      </div>

      {/* Quotation details and customer info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium mb-2">Quotation Details</h3>
          <p className="text-sm">
            <span className="font-semibold">Quotation Number:</span> {quotation.quote_number}<br />
            <span className="font-semibold">Date:</span> {new Date(quotation.created_at).toLocaleDateString('en-IN')}<br />
            <span className="font-semibold">Status:</span> {quotation.status}
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Customer Information</h3>
          <p className="text-sm">
            <span className="font-semibold">Name:</span> {quotation.customer_name}<br />
            {quotation.customer_phone && (
              <><span className="font-semibold">Phone:</span> {quotation.customer_phone}<br /></>
            )}
            {quotation.customer_email && (
              <><span className="font-semibold">Email:</span> {quotation.customer_email}<br /></>
            )}
            {quotation.customer_address && (
              <><span className="font-semibold">Address:</span> {quotation.customer_address}</>
            )}
          </p>
        </div>
      </div>

      {/* Products table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left text-sm">Sl. #</th>
            <th className="border p-2 text-left text-sm">Product Name</th>
            <th className="border p-2 text-left text-sm">Photo</th>
            <th className="border p-2 text-left text-sm">Description</th>
            <th className="border p-2 text-center text-sm">Qty</th>
            <th className="border p-2 text-right text-sm">Price</th>
            <th className="border p-2 text-right text-sm">Discounted Price</th>
            <th className="border p-2 text-right text-sm">Total</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => (
            <tr key={`${item.id}-${index}`} className="border-b">
              <td className="border p-2 text-sm">{index + 1}</td>
              <td className="border p-2 font-medium text-sm">{item.name}</td>
              <td className="border p-2 text-sm">
                {item.image ? (
                  <div className="w-16 h-16 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </td>
              <td className="border p-2 text-sm">
                {item.description || item.customization || "—"}
              </td>
              <td className="border p-2 text-center text-sm">{item.quantity}</td>
              <td className="border p-2 text-right text-sm">₹{item.price.toLocaleString()}</td>
              <td className="border p-2 text-right text-sm">
                ₹{item.discountedPrice.toLocaleString()}
                {item.price !== item.discountedPrice && (
                  <div className="text-xs text-green-600">
                    (Save: ₹{(item.price - item.discountedPrice).toLocaleString()})
                  </div>
                )}
              </td>
              <td className="border p-2 text-right font-medium text-sm">
                ₹{item.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="border p-2"></td>
            <td className="border p-2 text-right text-sm font-medium">Subtotal</td>
            <td className="border p-2 text-right font-medium">₹{quotation.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan={6} className="border p-2"></td>
            <td className="border p-2 text-right text-sm font-medium">GST @18%</td>
            <td className="border p-2 text-right font-medium">₹{quotation.gst.toLocaleString()}</td>
          </tr>
          <tr className="bg-muted/50">
            <td colSpan={6} className="border p-2"></td>
            <td className="border p-2 text-right text-sm font-bold">Total</td>
            <td className="border p-2 text-right font-bold">₹{quotation.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in words */}
      <div className="mb-6 border-t pt-2">
        <p className="text-sm font-medium">
          Amount: {numberToWords(quotation.total)} only
        </p>
      </div>

      {/* Payment details */}
      <div className="mb-6 border p-4 bg-muted/10 rounded">
        <h3 className="font-medium mb-2">Payment Details</h3>
        <p className="text-sm">
          <span className="font-semibold">RTGS Details:</span><br />
          Company name: Magnific Home Appliances<br />
          Bank Name: Axis Bank Koramangala<br />
          Account No: 924030028295392<br />
          IFSC Code: UTIB0000194
        </p>
      </div>

      {/* Terms and conditions */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Terms & Conditions</h3>
        <ol className="text-xs list-decimal pl-5 space-y-1">
          {termsAndConditions.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>This is an electronically generated Quotation and does not require a signature.</p>
      </div>
    </div>
  );
};

export default PrintableQuotation;
