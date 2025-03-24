import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CompanyDetails } from '@/services/quotationService';

// Company details for all quotations
export const companyDetails: CompanyDetails = {
  name: "Magnific Home Appliances",
  logo: "/lovable-uploads/41a736d8-ee0f-402a-9d94-ff46525d89bd.png", // Updated logo
  address: "No. 42/1, 1st Floor, J-Towers, 1000 Intermediate Ring Road (Near Royal Oak), Koramangala, Bengaluru - 560047",
  phone: "+91 9943 27081, +91 78925 27670",
  email: "info@magnific.in",
  website: "www.magnific.in",
  bank_name: "Axis Bank Koramangala",
  account_no: "924030028295392",
  ifsc_code: "UTIB0000194"
};

// Terms and conditions
export const termsAndConditions = [
  "Validity: 15 Days from the date of quotation.",
  "Payment: 30% of advance to be paid while booking, 100% payment before delivery.",
  "Company is not responsible for any breakage.",
  "Goods once sold cannot be taken back or exchanged.",
  "Request you to co-operate until delivery is done.",
  "Product should be checked at the time of delivery itself.",
  "Bulbs,battery cells for remotes are not included with the purchase of any light & fan fittings.",
  "Bulbs are charged additionally.",
  "Freight charges exclusive. Installation is chargeable.",
  "Rods customisation and clamp customisation charges extra.",
  "Installation charges 600 Rs per fans installation if required.",
  "One time site visit is free, rest is chargeable at 300 Rs per visit.",
  "No drilling, no rod installation. It has to be done by site electrician.",
  "We recommend that installation be carried out by a Magnific-trained technician, which would incur a small extra charge.",
  "Anchor bolt / Fan Hooks/ Fan Box installations need to be done by customer as per fan points."
];

// Print function that only prints the quotation container
export const printQuotation = () => {
  const printContent = document.getElementById('quotation-print-container');
  const originalContents = document.body.innerHTML;
  
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
        <title>Quotation</title>
        ${stylesHtml}
        <style>
          @media print {
            body { margin: 0; padding: 15mm; }
            .no-print { display: none !important; }
          }
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
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
  }, 250);
};

// Generate PDF from the quotation with optimized image handling
export const generatePDF = async () => {
  const printContent = document.getElementById('quotation-print-container');
  
  if (!printContent) {
    console.error("Quotation print container not found");
    return;
  }
  
  try {
    // Use a better quality/size ratio for the canvas
    const canvas = await html2canvas(printContent, {
      scale: 1.5, // Lower scale for smaller file size
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      // Optimize for rendering performance
      onclone: (document) => {
        // Process images to optimize them before PDF generation
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          // Add a quality attribute that html2canvas will use
          if (!img.hasAttribute('data-html2canvas-ignore')) {
            img.setAttribute('crossorigin', 'anonymous');
          }
        });
      }
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality instead of PNG
    
    // Create PDF with compression options
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    
    // Add some metadata
    pdf.setProperties({
      title: 'Quotation',
      subject: 'Quotation from Magnific Home Appliances',
      author: 'Magnific Home Appliances',
      creator: 'Magnific Quotation System'
    });
    
    pdf.save('Quotation.pdf');
    
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
