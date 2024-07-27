import { Bill } from '../models/billSchema.js';
import { Product } from '../models/productSchema.js';
import mongoose from 'mongoose';
// import twilio from 'twilio';
// const accountSid = 'AC45836df1be62b43b7e6022ca01e60a57';
// const authToken = '8ce3dc2a86d3d841b9fb93e2b4348a5f';
// const client = twilio(accountSid, authToken);

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

        // let messageBody = `Hello ${customerName}, your bill of amount ${totalAmount} has been created successfully.`;

        // if (totalAmount >= 1000) {
        //     messageBody += " Congratulations!! You have earned a gift voucher to spin and win as you shop from SG Store.";
        // } else {
        //     messageBody += " Congratulations! Thank you for shopping from SG Store.";
        // }

        // console.log('Sending message:', messageBody);

        // client.messages.create({
        //     body: messageBody,
        //     from: 'whatsapp:+14155238886', // Twilio's sandbox number for WhatsApp
        //     to: `whatsapp:${phoneNumber}`
        // })
        // .then(message => console.log('Message sent:', message.sid))
        // .catch(error => {
        //     console.error('Error sending message:', error);
        //     res.status(500).json({
        //         success: false,
        //         message: 'Failed to send WhatsApp message',
        //         error: error.message
        //     });
        // });

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