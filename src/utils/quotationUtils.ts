
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CompanyDetails } from '@/services/quotationService';

// Company details for all quotations
export const companyDetails: CompanyDetails = {
  name: "Magnific Home Appliances",
  logo: "/lovable-uploads/41a736d8-ee0f-402a-9d94-ff46525d89bd.png", // Updated logo
  address: "No. 42/1, 2nd Floor, I-Towers, 100ft Intermediate Ring Road, Near Royal Oak, Koramangala, Bengaluru - 560047",
  phone: "+91 80413 27081, +91 78928 27670",
  email: "info@magnific.in",
  website: "www.magnific.in",
  bank_name: "Axis Bank",
  account_no: "924030028295392",
  ifsc_code: "UTIB0000194"
};

// Terms and conditions
export const termsAndConditions = [
  "Validity: 15 Days from the date of quotation.",
  "Payment: 50% of advance to be paid while booking, 100% payment before delivery.",
  "No refunds unless there is an error from the company's side.",
  "Delivery will only be processed once the payment has cleared.",
  "Company is not responsible for any breakage.",
  "Goods once sold cannot be taken back or exchanged.",
  "Request you to co-operate until delivery is done.",
  "Product should be checked at the time of delivery itself.",
  "Bulbs, battery cells for remotes are not included with the purchase of any light & fan fittings.",
  "Bulbs are charged additionally.",
  "Freight charges exclusive. Installation is chargeable.",
  "Rods customisation and clamp customisation charges extra.",
  "Installation charges 600 Rs per fans installation if required.",
  "One time site visit is free, rest is chargeable at 300 Rs per visit.",
  "Order value must exceed ₹50,000 for free delivery."
];

// Print function that only prints the quotation container
export const printQuotation = () => {
  const printContent = document.getElementById('quotation-print-container');
  
  if (!printContent) {
    console.error("Quotation print container not found");
    return;
  }
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error("Could not open print window");
    return;
  }
  
  // Copy the styles from the current document to the new window
  const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
  let stylesHtml = '';
  
  stylesheets.forEach(node => {
    stylesHtml += node.outerHTML;
  });
  
  // Set the content of the print window
  printWindow.document.write(`
    <html>
      <head>
        <title>Magnific - Quotation</title>
        ${stylesHtml}
        <style>
          @media print {
            body { margin: 0; padding: 10mm; }
            .no-print { display: none !important; }
            @page { size: A4; margin: 0; }
          }
          body { 
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.4;
          }
          table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Print the document after a short delay to ensure all content is rendered
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// Generate PDF from the quotation with improved quality and text selection
export const generatePDF = async () => {
  const printContent = document.getElementById('quotation-print-container');
  
  if (!printContent) {
    console.error("Quotation print container not found");
    return false;
  }
  
  try {
    // Create a new jsPDF instance with better font support
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
    });
    
    // Define A4 dimensions (210mm x 297mm)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set margins
    const margin = 10;
    
    // Pre-load images to avoid rendering issues
    const images = Array.from(printContent.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              // Set crossOrigin to ensure images load properly
              img.crossOrigin = 'Anonymous';
            }
          })
      )
    );
    
    // Make sure all fonts are loaded
    await document.fonts.ready;
    
    // Use html2canvas with higher scale for better quality
    const canvas = await html2canvas(printContent, {
      scale: 3, // Higher scale for crisp text and images
      useCORS: true, // Enable CORS for images
      allowTaint: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      imageTimeout: 15000, // Longer timeout for image loading
      onclone: (clonedDoc) => {
        // Process cloned document before rendering
        const clonedContent = clonedDoc.getElementById('quotation-print-container');
        if (clonedContent) {
          // Make sure all images have crossOrigin set
          clonedContent.querySelectorAll('img').forEach((img) => {
            img.crossOrigin = 'Anonymous';
            // Ensure images are fully loaded
            if (!img.complete) {
              img.src = img.src;
            }
          });
        }
        return clonedDoc;
      }
    });
    
    // Calculate scaling to fit on A4 while maintaining aspect ratio
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Create multiple pages if content height exceeds page height
    let remainingHeight = contentHeight;
    let position = 0;
    let pageNumber = 1;
    
    // Add first page
    pdf.setPage(pageNumber);
    
    while (remainingHeight > 0) {
      // Calculate how much content to render on current page
      const heightOnThisPage = Math.min(
        remainingHeight,
        pageHeight - 2 * margin
      );
      
      // Calculate vertical crop position in the canvas
      const verticalPos = (position / contentHeight) * canvas.height;
      const heightInPixels = (heightOnThisPage / contentHeight) * canvas.height;
      
      // Create a temporary canvas for the current page section
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = heightInPixels;
      
      // Draw portion of the main canvas to this temporary canvas
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error("Failed to get canvas context");
      
      ctx.drawImage(
        canvas, 
        0, 
        verticalPos, 
        canvas.width, 
        heightInPixels, 
        0, 
        0, 
        tempCanvas.width, 
        tempCanvas.height
      );
      
      // Add the image to PDF with high quality
      const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        margin,
        contentWidth,
        heightOnThisPage,
        `page-${pageNumber}`,
        'FAST'
      );
      
      // Update remaining height and position
      remainingHeight -= heightOnThisPage;
      position += heightOnThisPage;
      
      // Add a new page if there's more content
      if (remainingHeight > 0) {
        pdf.addPage();
        pageNumber++;
      }
    }
    
    // Enable text layer for text selection in PDF
    pdf.setProperties({
      title: 'Magnific - Quotation',
      subject: 'Quotation from Magnific Home Appliances',
      author: 'Magnific Home Appliances',
      keywords: 'quotation, invoice, magnific',
      creator: 'Magnific Quotation System',
    });
    
    // Save the PDF with a meaningful name
    pdf.save('Magnific_Quotation.pdf');
    
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return false;
  }
};

// Format amount in words
export const numberToWords = (num: number): string => {
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const formatTenth = (n: number): string => {
    return n < 10 ? single[n] : n < 20 ? double[n - 10] : tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  };

  if (num === 0) return 'Zero';

  let result = '';
  let fraction = Math.round((num * 100) % 100);

  // Convert lakh and crore according to Indian numbering system
  if (num >= 10000000) {
    result += `${formatTenth(Math.floor(num / 10000000))} Crore `;
    num %= 10000000;
  }
  if (num >= 100000) {
    result += `${formatTenth(Math.floor(num / 100000))} Lakh `;
    num %= 100000;
  }
  if (num >= 1000) {
    result += `${formatTenth(Math.floor(num / 1000))} Thousand `;
    num %= 1000;
  }
  if (num >= 100) {
    result += `${single[Math.floor(num / 100)]} Hundred `;
    num %= 100;
  }
  if (num > 0) {
    result += formatTenth(num) + ' ';
  }

  result += 'Rupees';

  if (fraction > 0) {
    result += ` and ${formatTenth(fraction)} Paise`;
  }

  return result.trim();
};
