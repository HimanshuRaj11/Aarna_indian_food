import qz from "qz-tray";
import { connectPrinter } from "./qz";
import { generateInvoice } from "./invoice";

export async function printInvoice(invoice: any, Company: any) {

    await connectPrinter();
    const branchPrinterName = Company?.branch?.printerName;
    const printer = branchPrinterName;
    console.log("Printer Name:", printer);

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