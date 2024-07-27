import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BillPreview = ({ bill }) => {
  const generatePDF = () => {
    const widthInInch = 2; // 2 inches = 55mm
    const lengthInMM = 250; // 250mm
    const widthInPoints = widthInInch * 72;
    const lengthInPoints = lengthInMM * (72 / 25.4); // Convert mm to inches

    const doc = new jsPDF({ unit: 'pt', format: [widthInPoints, lengthInPoints] });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Heading
    doc.setFontSize(18);
    const headingText = 'SG Store';
    const headingWidth = doc.getTextWidth(headingText);
    const headingX = (pageWidth - headingWidth) / 2;
    doc.text(headingText, headingX, 20);

    // Address
    doc.setFontSize(7);
    const addressText = "Shop now. 6 industrial area, Delhi road Hisar (Haryana)" || "N/A";
    const addressLines = doc.splitTextToSize(addressText, pageWidth - 20);
    const addressX = pageWidth / 2;

    let addressY = 30; // Starting Y position
    addressLines.forEach((line) => {
      doc.text(line, addressX, addressY, { align: 'center' });
      addressY += 12; // Adjust spacing between lines
    });

    // Line after address
    doc.setLineDash([2, 2], 0); // Dotted line pattern
    doc.line(10, addressY + 5, pageWidth - 10, addressY + 5);

    // Invoice title
    addressY += 10;
    doc.setFontSize(8);
    const invoiceText = 'Invoice';
    const invoiceWidth = doc.getTextWidth(invoiceText);
    const invoiceX = (pageWidth - invoiceWidth) / 2;
    doc.text(invoiceText, invoiceX, addressY + 10);

    // Other bill details
    addressY += 15;
    doc.setFontSize(7);
    doc.text(`${bill.customerName}`, 10, addressY);
    doc.text(`${bill.phoneNumber || 'N/A'}`, 10, addressY + 15);
    doc.text(`${new Date(bill.createdAt).toLocaleString()}`, 10, addressY + 30);

    // Calculate total after coupon
    const totalAfterCoupon = (bill.totalAmount - (bill.couponAmount || 0)).toFixed(2);
    
    // Calculate additional Y position based on couponAmount
    const couponY = bill.couponAmount > 0 ? addressY + 50 : addressY + 40;
    
    // Display discount if couponAmount > 0
    if (bill.couponAmount > 0) {
      doc.text(`Discount: Rs. ${bill.couponAmount}`, 10, couponY);
    }
    doc.text(`Total Amount: Rs. ${totalAfterCoupon}`, 10, couponY + (bill.couponAmount > 0 ? 15 : 0));

    // Line before products table
    const productsTableY = couponY + (bill.couponAmount > 0 ? 30 : 15);
    doc.line(10, productsTableY, pageWidth - 10, productsTableY);

    // Products table
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text('Products:', 10, productsTableY + 20);

    const products = bill.products.map(product => [
      product.productname || 'N/A',
      product.quantity.toString(),
      `Rs. ${product.price || 0}`
    ]);

    const { height } = doc.autoTable({
      startY: productsTableY + 30,
      head: [['Items', 'Qty', 'Price']],
      body: products,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 10 },
        halign: 'center',
        lineWidth: 0,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      margin: { horizontal: 10 },
    });

    if (productsTableY + 30 + height > lengthInPoints - 50) {
      doc.addPage([widthInPoints, lengthInPoints], 'pt');
      addressY = 30;

      doc.setFontSize(18);
      doc.text(headingText, headingX, 20);
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 70, pageWidth - 10, 70);

      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.text('Products (continued):', 10, 80);
      doc.autoTable({
        startY: 90,
        head: [['Items', 'Qty', 'Price']],
        body: products,
        theme: 'plain',
        styles: {
          fontSize: 8,
          cellPadding: { top: 5, right: 10, bottom: 5, left: 10 },
          halign: 'center',
          lineWidth: 0,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
        },
        margin: { horizontal: 10 },
      });
    }

    // Total amount after coupon
    const finalY = doc.autoTable.previous.finalY || productsTableY;
    doc.setFontSize(10);
    const totalAmountText = `Total: Rs. ${totalAfterCoupon}`;
    const totalAmountWidth = doc.getTextWidth(totalAmountText);
    const xPosition = pageWidth - totalAmountWidth - 10;
    doc.text(totalAmountText, xPosition, finalY + 20);

    // Dotted line for "Thanks For Shopping"
    doc.setLineDash([2, 2], 0);
    doc.line(10, finalY + 40, pageWidth - 10, finalY + 40);
    const thanksText = 'Thanks For Shopping';
    const thanksWidth = doc.getTextWidth(thanksText);
    const thanksX = (pageWidth - thanksWidth) / 2;
    doc.setFontSize(10);
    doc.text(thanksText, thanksX, finalY + 60);

    // Dotted line below "Thanks For Shopping"
    doc.setLineDash([2, 2], 0);
    doc.line(10, finalY + 80, pageWidth - 10, finalY + 80);

    doc.save('bill-preview.pdf');
  };

  // Calculate total after coupon
  const totalAfterCoupon = (bill.totalAmount - (bill.couponAmount || 0)).toFixed(2);

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg mt-6">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold mt-4 mb-1">SG Store</h1>
        <p className="text-gray-600">SG store near Industrial Area, Hisar</p>
        <p className="text-gray-600">7015659124</p>
      </div>
      <div className="mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold mb-2">Bill Preview</h2>
        <p className="text-gray-700"><strong>Customer Name:</strong> {bill.customerName}</p>
        <p className="text-gray-700"><strong>Address:</strong> {bill.address || 'N/A'}</p>
        <p className="text-gray-700"><strong>Phone Number:</strong> {bill.phoneNumber || 'N/A'}</p>
        <p className="text-gray-700"><strong>Date:</strong> {new Date(bill.createdAt).toLocaleString()}</p>
        <p className="text-gray-700"><strong>Total Amount:</strong> Rs. {bill.totalAmount}</p>
        {bill.couponAmount > 0 && <p className="text-gray-700"><strong>Discount:</strong> Rs. {bill.couponAmount}</p>}
        {bill.couponAmount > 0 && <p className="text-gray-700"><strong>Total After Coupon:</strong> Rs. {totalAfterCoupon}</p>}
      </div>
      <button onClick={generatePDF} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Download PDF</button>
    </div>
  );
};

export default BillPreview;
