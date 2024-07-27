import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import BillForm from '../components/BillForm';
import Modal from '../components/Modal';

const Bill = () => {
  const [getuserdata, setUserdata] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const productsPerPage = 20;
  const role = localStorage.getItem('role');
  const totalPages = Math.ceil(getuserdata.length / productsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const getBillData = async () => {
    try {
      const response = await fetch("https://sg-store5.onrender.com/api/v1/bill/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Ensure 'bill' key exists and contains an array
      if (Array.isArray(data.bills)) {
        setUserdata(data.bills);
      } else {
        toast.error("Invalid data received from server.");
      }
    } catch (error) {
      toast.error("Failed to fetch bill data. Please try again.");
      console.error(error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    getBillData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredProducts = getuserdata.filter(bill => {
    const billDate = new Date(bill.createdAt);
    const matchesSearchQuery = bill.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.status?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = filterDate ? billDate.toISOString().split('T')[0] === filterDate : true;
    const matchesMonth = filterMonth ? (billDate.getMonth() + 1) === parseInt(filterMonth) : true;
    const matchesYear = filterYear ? billDate.getFullYear() === parseInt(filterYear) : true;

    return matchesSearchQuery && matchesDate && matchesMonth && matchesYear;
  });

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const deleteBill = async (id) => {
    try {
      const res2 = await fetch(`https://sg-store5.onrender.com/api/v1/bill/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const deletedata = await res2.json();
      console.log(deletedata);

      if (res2.status === 400 || !deletedata) {
        console.log("Error");
      } else {
        console.log("bill deleted");
        getBillData();
        toast.success("bill deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete bill", error);
      toast.error("Failed to delete bill. Please try again.");
    }
  };

  const viewHandler = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="container mx-auto p-4">
        <BillForm />
      </div>

      <div className="w-full p-4 overflow-x-auto">
        <input
          type="text"
          placeholder="Search by name, status, or phone number"
          value={searchQuery}
          onChange={handleSearchChange}
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <div className="mb-4 flex space-x-2">
          <input
            type="date"
            placeholder="Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          {/* <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">Month</option>
            {[...Array(12).keys()].map(month => (
              <option key={month + 1} value={month + 1}>
                {new Date(0, month).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select> */}
          {/* <input
            type="number"
            placeholder="Year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          /> */}
        </div>
        <div className="overflow-x-auto w-full max-w-screen">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead>
              <tr className="text-white bg-black">
                <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Customer Name</th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Phone Number</th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Address</th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Payment</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedProducts.map((bill, index) => {
                // Determine the color for the status
                const statusColor = bill.status === "Pending" ? "text-red-700" : "text-green-700";
                
                return (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{bill.customerName}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{bill.phoneNumber}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{bill.address}</td>
                    <td className={`whitespace-nowrap px-4 py-2 ${statusColor}`}>{bill.status}</td>
                    <td className="whitespace-nowrap px-4 py-2 flex space-x-2">
                      <a
                        href={`/billview/${bill._id}`}
                        className="rounded bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600"
                      >
                        View
                      </a>
                      {role === 'admin' && (
                        <>
                          <button 
                            className="rounded bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteBill(bill._id);
                            }}
                          >
                            Delete
                          </button>
                          <a 
                            href={`/updatebill/${bill._id}`} 
                            className="rounded bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Update
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="inline-block rounded bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-600"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            className="inline-block rounded bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-600"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedBill && (
          <div>
            <h2 className="text-xl font-bold mb-2">Bill Details</h2>
            <p><strong>Customer Name:</strong> {selectedBill.customerName}</p>
            <p><strong>Phone Number:</strong> {selectedBill.phoneNumber}</p>
            <p><strong>Address:</strong> {selectedBill.address}</p>
            <p><strong>Total Amount:</strong> {selectedBill.totalAmount}</p>
            <p><strong>couponAmount:</strong> {selectedBill.couponAmount}</p>
            <p><strong>Status:</strong> {selectedBill.status}</p>
            <h3 className="text-lg font-semibold mt-4">Products</h3>
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Product Name</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.products.map((product, index) => (
                  <tr key={index} className="divide-y divide-gray-200">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{product.productname}</td>
                    <td className="px-4 py-2">{product.quantity}</td>
                    <td className="px-4 py-2">{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bill;
