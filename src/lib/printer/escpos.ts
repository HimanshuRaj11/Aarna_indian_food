import qz from "qz-tray";
import { connectPrinter } from "./qz";
import { generateInvoice } from "./invoice";

export async function printInvoice(invoice: any, Company: any) {

    await connectPrinter();
    const printer = Company?.branch?.find(
        (b: any) => b._id.toString() === invoice.branchId._id.toString()
    )?.printerName;
    console.log("Company Name:", Company);
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