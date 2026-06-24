import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
    companyId: mongoose.Types.ObjectId;
    branchName: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    email?: string;
    phone: string;
    CountryCode: string;
    gstNumber?: string;
    panNumber?: string;
    lastInvoiceNo: number;
    ownerId: mongoose.Types.ObjectId;
    staffIds: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    dailyApprox?: number;
    lastInvoiceCheck?: Date;
    active?: boolean;
    lastSequenceUpdate?: number;
    printerName?: string;
}


const BranchSchema: Schema = new Schema<IBranch>(
    {
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        branchName: { type: String, required: true },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
            zipCode: { type: String, required: true }
        },
        email: { type: String },
        phone: { type: String, required: true },
        CountryCode: { type: String },
        gstNumber: { type: String },
        lastInvoiceNo: { type: Number, default: 0 },
        panNumber: { type: String },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        dailyApprox: { type: Number, default: 0 },
        lastInvoiceCheck: { type: Date },
        active: { type: Boolean, default: true },
        printerName: { type: String },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);
