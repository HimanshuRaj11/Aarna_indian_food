import qz from "qz-tray";
import { connectPrinter } from "./qz";
import { generateInvoice } from "./invoice";

export async function printInvoice(invoice: any, Company: any) {

    await connectPrinter();
    const printer = Company?.branch?.find(
        (b: any) => b._id.toString() === invoice.branchId._id.toString()
    )?.printerName;
    const config = qz.configs.create(printer);

    const data = generateInvoice(invoice, Company);


    console.log(Company?.branch);
    console.log(invoice);
    console.log(printer);

    await qz.print(config, [
        {
            type: "raw",
            format: "command",
            flavor: "hex",
            data,
        },
    ]);
}