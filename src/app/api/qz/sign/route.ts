import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createSign } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const data = await req.text();

        const privateKey = await fs.readFile(
            path.join(process.cwd(), "certificates", "private-key.pem"),
            "utf8"
        );

        const signer = createSign("RSA-SHA512");

        signer.update(data, "utf8");
        signer.end();

        const signature = signer.sign(privateKey, "base64");

        return new NextResponse(signature, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        console.error("Signature Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to sign request",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}