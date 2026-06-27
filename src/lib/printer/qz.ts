import qz from "qz-tray";

// let configured = false;

// function configureQZ() {
//     if (configured) return;

//     configured = true;

//     qz.security.setCertificatePromise(() =>
//         fetch("/api/qz/certificate").then((r) => r.text())
//     );

//     qz.security.setSignaturePromise((toSign) =>
//         fetch("/api/qz/sign", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "text/plain",
//             },
//             body: toSign,
//         }).then((r) => r.text())
//     );
// }
export async function connectPrinter() {
    try {
        // configureQZ();
        if (!qz.websocket.isActive()) {

            await qz.websocket.connect();
        }
    } catch (err) {
        console.error("QZ Connection Error:", err);
    }
}

export async function disconnectPrinter() {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
    }
}