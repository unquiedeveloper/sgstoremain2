import express from "express"
import { createBill, deleteBill, getallBill, getBill, updateBill } from "../controller/billController.js";


const router = express.Router();

router.post("/createBill" , createBill);
router.get("/getall" , getallBill);
router.delete("/delete/:id" , deleteBill);
router.put("/update/:id" , updateBill);
router.get("/me/:id" , getBill);

export default router