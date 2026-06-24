import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
    const data = await req.text();

    const privateKey = await fs.readFile(
        path.join(
            process.cwd(),
            "certificates",
            "private-key.pem"
        ),
        "utf8"
    );

    const sign = crypto.createSign("SHA512");

    sign.update(data);

    sign.end();

    const signature = sign.sign(privateKey, "base64");

    return new Response(signature, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}