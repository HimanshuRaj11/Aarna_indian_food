import { generateKeyPairSync } from "crypto";
import fs from "fs";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
    },
    publicKeyEncoding: {
        type: "spki",
        format: "pem",
    },
});

fs.writeFileSync("private-key.pem", privateKey);
fs.writeFileSync("public-key.pem", publicKey);

console.log("Keys generated successfully.");