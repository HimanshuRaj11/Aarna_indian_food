import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
    try {
        const certPath = path.join(
            process.cwd(),
            "certificates",
            "public-key.pem"
        );

        const certificate = await fs.readFile(certPath, "utf8");

        return new NextResponse(certificate, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        console.error("Certificate Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load certificate",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}