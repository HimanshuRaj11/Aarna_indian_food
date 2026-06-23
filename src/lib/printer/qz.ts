import qz from "qz-tray";

export async function connectPrinter() {
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
    }
}

export async function disconnectPrinter() {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
    }
}