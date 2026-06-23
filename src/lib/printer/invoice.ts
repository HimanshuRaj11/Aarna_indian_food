import EscPosEncoder from "esc-pos-encoder";
import moment from "moment";

export function generateInvoice(invoice: any) {
    const encoder = new EscPosEncoder();

    encoder.initialize();

    encoder.align("center");

    encoder.bold(true);

    encoder.line(invoice.companyName);

    encoder.bold(false);

    encoder.line(invoice.companyAddress);

    encoder.line(invoice.companyPhone);

    encoder.line("");

    encoder.bold(true);

    encoder.line(`INVOICE #${invoice.invoiceId}`);

    encoder.bold(false);

    encoder.line(moment(invoice.issueDate).format("DD/MM/YYYY hh:mm"));

    encoder.line("--------------------------------");

    encoder.align("left");

    encoder.line(`Customer : ${invoice.clientName}`);

    encoder.line(`Phone    : ${invoice.clientPhone}`);

    encoder.line("--------------------------------");

    invoice.products.forEach((item: any) => {

        encoder.bold(true);

        encoder.line(item.name);

        encoder.bold(false);

        encoder.line(
            `${item.quantity} x ${item.rate} = ${item.amount}`
        );
    });

    encoder.line("--------------------------------");

    encoder.line(`Subtotal : ${invoice.subTotal}`);

    invoice.appliedTaxes.forEach((tax: any) => {
        encoder.line(
            `${tax.taxName} : ${tax.amount}`
        );
    });

    encoder.bold(true);

    encoder.line(`TOTAL : ${invoice.grandTotal}`);

    encoder.bold(false);

    encoder.line("");

    encoder.align("center");

    encoder.line("THANK YOU");

    encoder.newline().newline().newline().newline();

    encoder.cut();

    return encoder.encode();
}