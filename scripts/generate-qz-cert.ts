import forge from "node-forge";
import fs from "fs";

const keys = forge.pki.rsa.generateKeyPair(2048);

const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = "01";

cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(
    cert.validity.notBefore.getFullYear() + 10
);

const attrs = [
    {
        name: "commonName",
        value: "AarnaIndianFood POS"
    },
    {
        name: "organizationName",
        value: "AarnaIndianFood"
    },
    {
        name: "organizationalUnitName",
        value: "Software"
    },
    {
        name: "countryName",
        value: "IN"
    }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

cert.sign(keys.privateKey, forge.md.sha512.create());

fs.writeFileSync(
    "certificates/private-key.pem",
    forge.pki.privateKeyToPem(keys.privateKey)
);

fs.writeFileSync(
    "certificates/public-cert.pem",
    forge.pki.certificateToPem(cert)
);

console.log("✅ Certificate generated");