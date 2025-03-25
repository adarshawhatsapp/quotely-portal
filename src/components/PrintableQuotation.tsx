
import React from "react";
import { Quotation } from "@/services/quotationService";
import { termsAndConditions, numberToWords } from "@/utils/quotationUtils";

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
    });
  };

  return (
    <div id="quotation-print-container" className="bg-white p-8 max-w-[210mm] mx-auto text-black">
      {/* Header with logo and title */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {quotation.company_details.logo && (
            <img 
              src={quotation.company_details.logo}
              alt="Magnific Logo" 
              className="h-16 object-contain"
              style={{ filter: "brightness(0) saturate(100%) invert(29%) sepia(98%) saturate(1954%) hue-rotate(191deg) brightness(94%) contrast(98%)" }}
            />
          )}
        </div>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-blue-600">Quotation</h1>
        </div>
        <div className="text-right">
          <p className="font-medium">Estimate No: {quotation.quote_number}</p>
          <p className="font-medium">Date: {formatDate(quotation.created_at)}</p>
        </div>
      </div>

      {/* Company Details */}
      <div className="mb-4 text-sm">
        <p className="text-gray-700">Tel: {quotation.company_details.phone}</p>
        <p className="text-gray-700">E: {quotation.company_details.email}</p>
        <p className="text-gray-700">{quotation.company_details.address}</p>
      </div>

      {/* Customer Information */}
      <div className="mb-6 text-sm border-t border-b py-3">
        <p className="font-bold">TO: {quotation.customer_name}</p>
        {quotation.customer_phone && <p className="text-gray-700">Contact: {quotation.customer_phone}</p>}
        {quotation.customer_email && <p className="text-gray-700">Email: {quotation.customer_email}</p>}
        {quotation.customer_address && <p className="text-gray-700">Address: {quotation.customer_address}</p>}
      </div>

      {/* Products table */}
      <table className="w-full border-collapse mb-6 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">S.No.</th>
            <th className="border border-gray-300 p-2 text-center w-24">MODEL IMAGE</th>
            <th className="border border-gray-300 p-2 text-left">MODEL NAME</th>
            <th className="border border-gray-300 p-2 text-left">TECHNICAL DETAILS</th>
            <th className="border border-gray-300 p-2 text-center">AREA</th>
            <th className="border border-gray-300 p-2 text-center">Qty</th>
            <th className="border border-gray-300 p-2 text-right">L.PRICE</th>
            <th className="border border-gray-300 p-2 text-right">AFTER DISCOUNT</th>
            <th className="border border-gray-300 p-2 text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => (
            <tr key={`${item.id}-${index}`} className="border-b">
              <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 p-2 text-center">
                {item.image ? (
                  <div className="w-24 h-24 overflow-hidden mx-auto">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mx-auto">
                    No image
                  </div>
                )}
              </td>
              <td className="border border-gray-300 p-2 font-medium">
                {item.name}
                {item.modelNumber && <div className="text-xs text-gray-600">Model: {item.modelNumber}</div>}
              </td>
              <td className="border border-gray-300 p-2 text-xs" style={{ maxWidth: "200px", wordWrap: "break-word" }}>
                <div className="whitespace-pre-line">{item.description || item.customization || "—"}</div>
              </td>
              <td className="border border-gray-300 p-2 text-center">{item.area || "—"}</td>
              <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
              <td className="border border-gray-300 p-2 text-right">{item.price.toLocaleString()}</td>
              <td className="border border-gray-300 p-2 text-right">
                {item.discountedPrice.toLocaleString()}
              </td>
              <td className="border border-gray-300 p-2 text-right font-medium">
                {item.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2 text-right font-medium">Subtotal</td>
            <td className="border border-gray-300 p-2 text-right font-medium">{quotation.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan={7} className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2 text-right font-medium">GST @18%</td>
            <td className="border border-gray-300 p-2 text-right font-medium">{quotation.gst.toLocaleString()}</td>
          </tr>
          <tr className="bg-gray-100">
            <td colSpan={7} className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2 text-right font-bold">Total</td>
            <td className="border border-gray-300 p-2 text-right font-bold">{quotation.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in words */}
      <div className="mb-4 border-t pt-2">
        <p className="text-sm font-medium">
          Amount: {numberToWords(quotation.total)} only
        </p>
      </div>

      {/* Payment details */}
      <div className="mb-4 border p-3 bg-gray-50 rounded text-sm">
        <h3 className="font-medium mb-1">Payment Details</h3>
        <p>
          <span className="font-semibold">RTGS Details:</span><br />
          Company name: {quotation.company_details.name}<br />
          Bank Name: {quotation.company_details.bank_name}<br />
          Account No: {quotation.company_details.account_no}<br />
          IFSC Code: {quotation.company_details.ifsc_code}
        </p>
      </div>

      {/* Terms and conditions */}
      <div className="mb-4 text-xs">
        <h3 className="font-medium mb-1 text-sm">Terms & Conditions</h3>
        <ol className="list-decimal pl-5 space-y-0.5">
          {termsAndConditions.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-2 border-t text-center text-xs text-gray-500">
        <p>This is an electronically generated Quotation and does not require a signature.</p>
        <p className="font-medium text-blue-600 mt-1">{quotation.company_details.website}</p>
      </div>
    </div>
  );
};

export default PrintableQuotation;
