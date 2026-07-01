import UserModel from "@/Model/User.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";
import CompanyModel from "@/Model/Company.model";
import { verifyUser } from "@/lib/verifyUser";
import InvoiceModel from "@/Model/Invoice.model";
import branchModel from "@/Model/branch.model";
import moment from "moment";


export async function POST(request: Request) {

    try {

        // const { startDate, endDate, branchId } = await request.json();
        const { branchName, sequenceStart } = await request.json();

        // const user_id = await verifyUser();
        // if (!user_id) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        // const User = await UserModel.findById(user_id);
        // if (!User) return NextResponse.json({ message: "User not found", success: false }, { status: 404 });


        // Set delete: false on all invoices
        // const updateResult = await InvoiceModel.updateMany({}, { $set: { delete: false } });
        // console.log("Invoice update result:", updateResult);


        // const companyId = "6803e4c62a9cdbcaf5b3e6e4"
        const startDate = moment('2026-06-01').startOf('day').toDate();
        // const end = moment('2025-12-31').endOf('day').toDate();
        // const branchName = "Georgetown"
        // const branchName = "Berbice"
        const invoiceFilter: any = {
            issueDate: { $gte: startDate },
            // branchId: branchId,
            branchName,
            InvoiceStatus: "Done",
            BillType: { $ne: "KOT" },
            delete: { $ne: true },

        };

        // const branch = await branchModel.findOne({ _id: branchId });
        const branch = await branchModel.findOne({ branchName });

        if (!branch) {
            return NextResponse.json({ message: "Branch not found" }, { status: 404 });
        }


        const invoices = await InvoiceModel.find(invoiceFilter)
            .select("_id branchName branchId createdAt grandTotal invoiceId delete")
            .sort({ issueDate: 1 }).lean();


        if (invoices.length === 0) {
            return NextResponse.json(
                { message: "No invoices found to update" },
                { status: 200 }
            );
        }
        // const sequenceStart = 3838; // 3765



        const bulkOps = invoices.map((inv, index) => ({
            updateOne: {
                filter: { _id: inv._id },
                update: {
                    $set: {
                        invoiceId: sequenceStart + index + 1,
                    },
                },
            },
        }));


        await InvoiceModel.bulkWrite(bulkOps);

        // 5️⃣ Update branch sequence
        const finalSequence = sequenceStart + invoices.length;

        branch.lastInvoiceNo = finalSequence;
        branch.lastSequenceUpdate = finalSequence;

        await branch.save();

        return NextResponse.json({ message: "Invoice sequence arranged", success: true }, { status: 200 });

    } catch (error) {
        console.log(error);

        return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
    }

}


