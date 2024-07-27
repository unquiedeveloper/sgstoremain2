import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa'; // Importing search icon from react-icons/fa

const Product = () => {
  const [getuserdata, setUserdata] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    getProductsData();
  }, []);

  const getProductsData = async () => {
    try {
      const response = await fetch("https://sg-store5.onrender.com/api/v1/admin/products/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (Array.isArray(data.products)) {
        setUserdata(data.products);
      } else {
        toast.error("Invalid data received from server.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch product data. Please try again.");
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const totalPages = Math.ceil(getuserdata.length / productsPerPage);

  const Filter = () => {
    return getuserdata.filter(product => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.uniqueid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.price.toString().includes(searchTerm.toLowerCase()) ||
        product.qty.toString().includes(searchTerm.toLowerCase())
      );
    });
  };

  const displayedProducts = Filter().slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const deleteProduct = async (id) => {
    try {
      const res2 = await fetch(`https://sg-store5.onrender.com/api/v1/admin/products/${id}`, {
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
        console.log("product deleted");
        getProductsData();
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Failed to delete employee. Please try again.");
    }
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="overflow-x-auto w-full max-w-screen">
        <div className="flex mb-2 justify-between">
          <div className="flex items-center"> {/* Adjusted for icon alignment */}
            <FaSearch className="text-gray-500 mr-2" /> {/* Search icon */}
            <input
              type="text"
              className="form-control border border-black"
              placeholder="Search by name, unique ID, price, or quantity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-right">
            <a href="/addproducts">
              <button className="bg-red-700 text-white px-4 py-1 font-medium hover:bg-red-600">Add+</button>
            </a>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead>
            <tr className="bg-black">
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Unique ID</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Name</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Brand</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Color</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Qty</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Price</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-white">Size</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedProducts.map((product, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{product.uniqueid}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{product.name}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{product.brand}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{product.color}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{product.qty}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{product.price}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{product.size}</td>
                <td className="whitespace-nowrap px-4 py-2 flex space-x-2">
                  <a href={`/productview/${product._id}`} className="rounded bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600">
                    View
                  </a>
                  {role === 'admin' && (
                    <>
                      <button onClick={() => deleteProduct(product._id)} className="rounded bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600">
                        Delete
                      </button>
                      <a href={`/editproduct/${product._id}`} className="rounded bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-600">
                        Update
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button className="inline-block rounded bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-600" onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
        <button className="inline-block rounded bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-600" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Product;
