import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

function ProductPreview({ product1 }) {
  const [previews, setPreviews] = useState([]);
  const barcodeRef = useRef(null);
  const uniqueId = product1.uniqueid;

  const generatePDF = () => {
    const widthInInches = 3.5; // Updated width in inches
    const heightInInches = 2; // Updated height in inches

    // Initialize jsPDF with orientation, unit, and format
    const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [widthInInches, heightInInches] });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Product details
    doc.setFontSize(10); // Adjust font size for details
    let currentY = 0.2; // Initialize Y position in inches

    // Product Name
    doc.setFont('helvetica', 'normal'); // Normal font for details
    doc.text(`Product: ${product1.name}`, 0.2, currentY);
    currentY += 0.2;

    // Color
    doc.text(`Color: ${product1.color || 'N/A'}`, 0.2, currentY);
    currentY += 0.2;

    // Size
    doc.text(`Size: ${product1.size || 'N/A'}`, 0.2, currentY);
    currentY += 0.2;

    // Total Amount
    const priceFontSize = 12; // Set the desired font size for the price
    doc.setFontSize(priceFontSize); // Set font size for price text
    
    const totalAmountText = `Price: Rs ${product1.price || 0} (incl. of taxes)`;
    const totalAmountWidth = doc.getTextWidth(totalAmountText) / 72; // Convert width to inches
    const xPosition = (pageWidth - totalAmountWidth) / 6 ; // Center the text horizontally
    doc.setFont('helvetica', 'bold'); // Set font to bold for price
    doc.text(totalAmountText, xPosition, currentY);
    
    // Reset font style and size back to normal
    doc.setFontSize(8); // Reset to the original font size
    doc.setFont('helvetica', 'normal');
    currentY += 0.3;

    // Barcode
    if (barcodeRef.current) {
      const barcodeSvg = barcodeRef.current;
      const svgString = new XMLSerializer().serializeToString(barcodeSvg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        // Adjust canvas size to fit barcode
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const barcodeImgData = canvas.toDataURL("image/png");

        // Adjust barcode dimensions
        const barcodeWidth = 2; // Width in inches (adjusted smaller)
        const barcodeHeight = 0.4; // Height in inches (adjusted smaller)
        const barcodeX = (pageWidth - barcodeWidth) / 2; // Center the barcode horizontally
        const barcodeY = currentY - 0.2; // Move barcode up by 0.1 inch

        // Add the barcode to the PDF
        doc.addImage(barcodeImgData, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

        // Draw a bold line below the barcode
        doc.setLineWidth(0.02); // Set line width (adjust as needed)
        doc.line(0.2, barcodeY + barcodeHeight + 0.1, pageWidth - 0.2, barcodeY + barcodeHeight + 0.1); // Draw the line

        // Add "Marketed By:" text
        currentY = barcodeY + barcodeHeight + 0.2;
        doc.setFontSize(8); // Set font size for text
        doc.setFont('helvetica', 'bold'); // Bold font for "Marketed By:"
        doc.text("Marketed By:", 0.2, currentY);
        currentY += 0.2;

        // Add SG Store and address details
        doc.setFont('helvetica', 'normal'); // Normal font for details
        doc.text("SG Store", 0.2, currentY);
        currentY += 0.2;
        doc.text("Shop no. 6, Industrial area, main Delhi , hisar(haryana)", 0.2, currentY);
        currentY += 0.3;
        doc.text("Rohtak road, hisar(haryana)", 0.2, currentY); // Add this line

        // Save the PDF data to state and local storage
        const pdfData = doc.output('datauristring');
        setPreviews((prevPreviews) => {
          const newPreviews = [...prevPreviews, pdfData];
          localStorage.setItem('previews', JSON.stringify(newPreviews));
          return newPreviews;
        });
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    }
  };

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, uniqueId, {
        format: "CODE128",
        lineColor: "#000",
        width: 1, // Adjust width to fit PDF size
        height: 20, // Adjust height to fit PDF size
        displayValue: false // Display the barcode value
      });
    }

    // Load previews from local storage
    const storedPreviews = JSON.parse(localStorage.getItem('previews')) || [];
    setPreviews(storedPreviews);
  }, [uniqueId]);

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg mt-6">
      <div className="mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold mb-2">Product Preview</h2>
        <p className="text-gray-700"><strong>Customer Name:</strong> {product1.name}</p>
        <p className="text-gray-700"><strong>Brand:</strong> {product1.brand || 'N/A'}</p>
        <p className="text-gray-700"><strong>Phone Number:</strong> {product1.color || 'N/A'}</p>
        <p className="text-gray-700"><strong>Transaction ID:</strong> {product1._id}</p>
        <p className="text-gray-700"><strong>Created At:</strong> {new Date(product1.createdAt).toLocaleString()}</p>
        <p className="text-gray-700"><strong>Total Amount:</strong> Rs. {product1.price || 0}</p>
        <div>
          <svg ref={barcodeRef}></svg>
        </div>
      </div>
      <div className="mb-4">
        {/* Additional details or table if necessary */}
      </div>
      <button
        onClick={generatePDF}
        className="bg-blue-500 text-white px-3 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Download PDF
      </button>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Generated Previews</h3>
        {previews.length === 0 ? (
          <p className="text-gray-700">No previews generated yet.</p>
        ) : (
          previews.map((preview, index) => (
            <div key={index} className="mb-2">
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Download Preview {index + 1}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductPreview;
