import { promises as fs } from "fs";
import path from "path";

export async function GET() {
    const certPath = path.join(
        process.cwd(),
        "certificates",
        "public-cert.pem"
    );

    const cert = await fs.readFile(certPath, "utf8");

    return new Response(cert, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}