import connectDB from "@/lib/DB";
import { InternalServerError } from "@/lib/handelError";
import { verifyUser } from "@/lib/verifyUser";
import branchModel from "@/Model/branch.model";
import UserModel from "@/Model/User.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const user_id = await verifyUser();
        if (user_id instanceof NextResponse) {
            return user_id;
        }

        const user = await UserModel.findById(user_id).select("-password").populate({
            path: 'branchId',
            model: branchModel
        }).lean();
        console.log(user);

        return NextResponse.json({ user, success: true }, { status: 200 })

    } catch (error) {
        console.log(error + "kjhjkhjkhjkhjh");

        return NextResponse.json(InternalServerError(error as Error), { status: 503 });
    }
}