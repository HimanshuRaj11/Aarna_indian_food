import qz from "qz-tray";

export async function connectPrinter() {
    try {
        if (!qz.websocket.isActive()) {
            await qz.websocket.connect();
            console.log("QZ Connected");
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