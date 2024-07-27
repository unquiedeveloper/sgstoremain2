import { Bill } from '../models/billSchema.js';
import { Product } from '../models/productSchema.js';
import mongoose from 'mongoose';

export const createBill = async (req, res) => {
    const { customerName, phoneNumber, address, products, couponAmount = 0, status } = req.body;

    try {
        let totalAmount = 0;
        const updatedProducts = [];

        for (const product of products) {
            const { uniqueid, quantity } = product;

            const existingProduct = await Product.findOne({ uniqueid });

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: `Product with uniqueid ${uniqueid} not found`
                });
            }

            if (existingProduct.qty < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient quantity available for product with uniqueid ${uniqueid}`
                });
            }

            totalAmount += existingProduct.price * quantity;

            existingProduct.qty -= quantity;

            await existingProduct.save();

            updatedProducts.push({
                uniqueid,
                quantity,
                productname: existingProduct.name,
                price: existingProduct.price
            });
        }

        totalAmount -= couponAmount;

        const newBill = await Bill.create({
            customerName,
            phoneNumber,
            address,
            products: updatedProducts,
            totalAmount,
            couponAmount,
            status
        });


        res.status(201).json({
            success: true,
            message: 'Bill created successfully and WhatsApp message sent!',
            bill: newBill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create bill',
            error: error.message
        });
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