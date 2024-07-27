import React, { useState } from 'react';
import BillPreview from './BillPreview';
import toast from 'react-hot-toast';
import BarcodeScanner2 from './BarcodeScanner2';

const BillForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [products, setProducts] = useState([{ uniqueid: '', quantity: 1 }]);
  const [couponAmount, setCouponAmount] = useState(0);  // Initialize to 0
  const [status, setStatus] = useState('Pending');  // New state for payment method
  const [bill, setBill] = useState(null);

  const handleProductChange = (index, key, value) => {
    const newProducts = [...products];
    newProducts[index][key] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { uniqueid: '', quantity: 1 }]);
  };

  const deleteProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      customerName,
      phoneNumber,
      address,
      products,
      couponAmount: Number(couponAmount),  // Ensure it's a number
      status,  // Include payment method in the data
    };

    try {
      const response = await fetch('http://localhost:4000/api/v1/bill/createBill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      toast(result.message);
      setBill(result.bill);
      console.log(bill);
    } catch (error) {
      toast.error('Error in creating Bill');
      console.error('Error creating bill:', error);
    }
  };

  const handleBarcodeScan = (barcode) => {
    handleProductChange(products.length - 1, 'uniqueid', barcode);
  };

  return (
    <>
      <BarcodeScanner2 onScan={handleBarcodeScan} />
      <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4">Create Bill</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Customer Name:
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Phone Number:
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Address:
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Coupon Amount:
            <input
              type="number"
              value={couponAmount}
              onChange={(e) => setCouponAmount(Number(e.target.value))} // Ensure it's a number
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Payment Method:
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="Pending">Pending</option>
              <option value="Cash">Cash</option>
              <option value="Paytm">Paytm</option>
            </select>
          </label>
        </div>
        <h3 className="text-xl font-semibold mb-2">Products</h3>
        {products.map((product, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
            <label className="block text-gray-700 mb-2">
              Product ID:
              <input
                type="text"
                value={product.uniqueid}
                onChange={(e) => handleProductChange(index, 'uniqueid', e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </label>
            <label className="block text-gray-700 mb-2">
              Quantity:
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </label>
            <button
              type="button"
              onClick={() => deleteProduct(index)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md shadow-sm"
            >
              Delete Product
            </button>
          </div>
        ))}
        <div className="flex space-x-2 mb-4">
          <button type="button" onClick={addProduct} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm">
            Add Product
          </button>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm">
            Create Bill
          </button>
        </div>
      </form>
      {bill && <BillPreview bill={bill} />}
    </>
  );
};

export default BillForm;
