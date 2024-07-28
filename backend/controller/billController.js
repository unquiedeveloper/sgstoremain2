import { Bill } from '../models/billSchema.js';
import { Product } from '../models/productSchema.js';
import mongoose from 'mongoose';

export const createBill = async (req, res) => {
    const { customerName, phoneNumber, address, products, couponAmount = 0 , status } = req.body;
  
    // Start a session and begin a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      let totalAmount = 0;
      const updatedProducts = [];
  
      for (const product of products) {
        const { uniqueid, quantity } = product;
  
        // Find product by uniqueid within the session
        const existingProduct = await Product.findOne({ uniqueid }).session(session);
  
        if (!existingProduct) {
          throw new Error(`Product with uniqueid ${uniqueid} not found`);
        }
  
        // Check if sufficient quantity is available
        if (existingProduct.qty < quantity) {
          throw new Error(`Insufficient quantity for product ${uniqueid}`);
        }
  
        // Reduce quantity and save the product within the session
        existingProduct.qty -= quantity;
        await existingProduct.save({ session });
  
        // Calculate total amount
        totalAmount += existingProduct.price * quantity;
  
        // Add updated product to the list
        updatedProducts.push({ uniqueid, quantity, price: existingProduct.price });
      }
  
      // Apply coupon amount to the total amount
      const finalAmount = totalAmount - couponAmount;
  
      // Create a new bill with the updated products and final amount
      const newBill = new Bill({
        customerName,
        phoneNumber,
        address,
        products: updatedProducts,
        totalAmount: finalAmount,
        status,
      });
  
      // Save the new bill within the session
      await newBill.save({ session });
  
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
  
      // Send success response with the created bill
      res.status(201).json({ message: 'Bill created successfully', bill: newBill });
    } catch (error) {
      // Abort the transaction in case of error
      await session.abortTransaction();
      session.endSession();
      
      // Send error response
      res.status(400).json({ message: error.message });
    }
  };


export const getallBill = async (req, res) => {
    try {
        const bills = await Bill.find();
        res.status(200).json({
            success: true,
            bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const deleteBill = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Bill.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Bill deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


export const updateBill = async (req, res, next) => {
    const { id } = req.params;
    const { customerName, phoneNumber, address, products, couponAmount, status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Cash', 'Paytm'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status value. Allowed values are ${validStatuses.join(', ')}.`
        });
    }

    try {
        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Bill ID.'
            });
        }

        // Find the bill by ID and update
        const updatedBill = await Bill.findByIdAndUpdate(
            id,
            { customerName, phoneNumber, address, products, couponAmount, status },
            { new: true, runValidators: true } // Run validators to ensure data integrity
        );

        // Check if the bill was found and updated
        if (!updatedBill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bill updated successfully!',
            bill: updatedBill
        });
    } catch (error) {
        // Handle any other errors
        console.error('Error updating bill:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getBill = async (req, res, next) => {
    const { id } = req.params;
    const bill = await Bill.findById(id);
    if (!bill) {
        return res.status(404).json({
            success: false,
            message: "bill not found"
        });
    }
    res.status(200).json({
        success: true,
        bill
    });
};
