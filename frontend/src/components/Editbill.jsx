import React , {useState , useEffect}from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Editbill() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inpval, setINP] = useState({
    customerName: "",
    phoneNumber: "",
    address: "",
    totalAmount: "",
    couponAmount: "",
    
    status: "",
  });
  const [error, setError] = useState("");

  const setdata = (e) => {
    const { name, value } = e.target;
    setINP((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getEmployeeData = async () => {
    const token = localStorage.getItem("adminToken"); // Get the token for authentication

    try {
      const response = await fetch(`http://localhost:4000/api/v1/bill/me/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          
        },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.bill) {
        setINP(data.bill);
      } else {
        toast.error("Invalid data received from server.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch admin data. Please try again.");
    }
  };

  useEffect(() => {
    getEmployeeData();
  }, []);

  const addinpdata = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/bill/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inpval),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Updated admin data:", data);

      toast.success("Bill   updated successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bill. Please try again.");
    }
  };

  return (
    <div className="bg-white border-4 rounded-lg shadow relative m-10">
      <div className="flex items-start justify-between p-5 border-b rounded-t">
        <h3 className="text-xl font-semibold">Edit Bill </h3>
        <button
          type="button"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          data-modal-toggle="product-modal"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <form onSubmit={addinpdata}>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="CustomerName"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
                CustomerName
              </label>
              <input
                type="text"
                name="CustomerName"
                onChange={setdata}
                value={inpval.customerName}
                id="name"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                placeholder="Enter Name"
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="address"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
                 address
              </label>
              <input
                type="text"
                name=" address"
                id=" address"
                onChange={setdata}
                value={inpval.address}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                placeholder="Enter address"
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
                phoneNumber
              </label>
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                onChange={setdata}
                value={inpval.phoneNumber}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                placeholder="Enter Phone Number"
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="totalAmount"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
                totalAmount
              </label>
              <input
                type="number"
                name="totalAmount"
                id="totalAmount"
                onChange={setdata}
                value={inpval.totalAmount}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                placeholder="Enter TotalAmount"
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="couponAmount"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
               couponAmount
              </label>
              <input
                type="number"
                name="couponAmount"
                id="couponAmount"
                onChange={setdata}
                value={inpval.couponAmount}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                placeholder="Enter couponAmount"
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="couponAmount"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
               payment
              </label>
              <input
                type="text"
                name="status"
                id="status"
                onChange={setdata}
                value={inpval.status}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                placeholder="Enter payment method "
                required
              />
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 rounded-b">
            <button
              className="text-white bg-red-700 hover:bg-red-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              type="submit"
            >
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Editbill;
