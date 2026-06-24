import { verifyUser } from "@/lib/verifyUser";
import CompanyModel from "@/Model/Company.model";
import UserModel from "@/Model/User.model";
import { NextResponse } from "next/server";
import BranchModel from "@/Model/branch.model";

export async function GET(request: Request) {
    try {
        const userId = await verifyUser();
        const user = await UserModel.findById({ _id: userId });
        if (!user) {
            return NextResponse.json({ message: "User not found" });
        }
        const userCompanyId = user.companyId;

        const company = await CompanyModel.findById({ _id: userCompanyId }).populate({
            path: 'branch',
            model: BranchModel
        }).lean();

        return NextResponse.json({ company });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" });
    }
}