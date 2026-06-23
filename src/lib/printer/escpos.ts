import qz from "qz-tray";
import { connectPrinter } from "./qz";
import { generateInvoice } from "./invoice";

export async function printInvoice(invoice: any, Company: any) {

    await connectPrinter();

    const printer = "Star SP700 TearBar (SP712)"; // change

    const config = qz.configs.create(printer);

    const data = generateInvoice(invoice, Company);

    await qz.print(config, [
        {
            type: "raw",
            format: "command",
            flavor: "hex",
            data,
        },
    ]);
}