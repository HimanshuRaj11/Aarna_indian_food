import { verifyUser } from "@/lib/verifyUser";
import ProductCategoryModel from "@/Model/Category.model";
import CompanyModel from "@/Model/Company.model";
import ProductModel from "@/Model/Product.model";
import UserModel from "@/Model/User.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const User_id = await verifyUser();

        const user = await UserModel.findById(User_id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const company = await CompanyModel.findById(user.companyId);
        if (!company) {
            return NextResponse.json(
                { success: false, message: "Company not found" },
                { status: 404 }
            );
        }

        const { categoryName } = await request.json();

        const existingCategory = await ProductCategoryModel.findOne({
            companyId: company._id,
        });

        if (!existingCategory) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        // Remove category from category list
        existingCategory.category = existingCategory.category.filter(
            (cat: string) => cat !== categoryName
        );
        await existingCategory.save();

        // Delete all products of this category
        await ProductModel.deleteMany({
            companyId: company._id,
            category: categoryName,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category and associated products deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete category",
                error,
            },
            { status: 500 }
        );
    }
}