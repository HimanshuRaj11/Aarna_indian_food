import EscPosEncoder from "esc-pos-encoder";
import moment from "moment";

export function generateInvoice(invoice: any, Company: any) {
    const encoder = new EscPosEncoder();
    encoder.initialize();

    // 1. KOT Top Indicator Header
    if (invoice?.BillType === "KOT") {
        encoder.align("right").bold(true).line(`#${invoice.BillType}`).bold(false);
    }

    // 2. Main Header (Skipped if KOT)
    if (invoice?.BillType !== "KOT") {
        encoder.align("center");
        encoder.bold(true).line(invoice.companyName.toUpperCase());

        if (Company?.vatId) {
            encoder.line(Company.vatId.toUpperCase());
        }

        // Branch address fallback logic
        const branch = invoice?.branchId;
        const address = branch?.address
            ? `${branch.address.street} ${branch.address.city}`
            : invoice.companyAddress;

        if (address) {
            encoder.bold(false).line(address.toUpperCase());
        }

        if (Company?.phone) {
            encoder.line(Company.phone.toString());
        }
        encoder.line("");
    }

    // 3. Tax Invoice Meta Info
    encoder.align("center").bold(true).line(`TAX INVOICE: ${invoice.invoiceId}`);
    encoder.bold(false).line(`DATE: ${moment(invoice.issueDate).format('DD/MM/YYYY hh:mm A')}`);
    encoder.line("");

    // 4. Customer Info
    encoder.align("left");
    encoder.line("--------------------------------");
    encoder.bold(true).line(`CUSTOMER: ${invoice.clientName.toUpperCase()}`);
    encoder.bold(false).line(`PHONE: ${invoice.clientPhone}`);
    encoder.line("--------------------------------");

    invoice.products.forEach((product: any) => {
        let itemLine = "";

        if (invoice?.BillType === "KOT" && product.kot_completed) {
            itemLine += "[✓] ";
        }

        itemLine += product.name.toUpperCase();

        if (product?.Specification) {
            itemLine += ` (${product.Specification.toUpperCase()})`;
        }

        encoder.bold(true).line(itemLine);
        encoder.bold(false);

        if (invoice?.BillType === "KOT") {
            encoder.align("right").line(`QTY: ${product.quantity}`).align("left");
        } else {
            const currency = invoice.currency || "";
            const details = `${product.quantity} x ${currency}${product.rate} = ${currency}${product.amount}`;
            encoder.align("right").line(details).align("left");
        }
    });
    encoder.line("--------------------------------");

    // 6. Totals & Financial Calculations (Skipped if KOT)
    if (invoice?.BillType !== "KOT") {
        const currency = invoice.currency || "";
        const symbol = Company?.currency?.symbol || currency;

        encoder.align("left");

        // Subtotal
        encoder.bold(true).line(`SUBTOTAL: ${currency} ${invoice.subTotal.toFixed(2)}`).bold(false);

        // Taxes
        invoice?.appliedTaxes?.forEach((tax: any) => {
            encoder.line(`${tax.taxName.toUpperCase()} (${tax.percentage}%): ${currency} ${tax.amount.toFixed(2)}`);
        });

        // Exempted VAT
        if (invoice?.isExempted) {
            encoder.line("VAT(0%): EXEMPTED");
        }

        // Percentage vs Flat Discount
        if (invoice.discountValue > 0) {
            if (invoice.discountType === "percentage") {
                const taxSum = invoice.appliedTaxes?.reduce((sum: number, tax: any) => sum + tax.amount, 0) || 0;
                const baseForDiscount = invoice.subTotal + taxSum;
                const computedDiscount = (Math.round((baseForDiscount * invoice.discountValue) / 100 / 50) * 50).toFixed(2);

                encoder.line(`DISCOUNT: -${invoice.discountValue.toFixed(2)}%`);
                encoder.line(`          -${symbol}${computedDiscount}`);
            } else {
                encoder.line(`DISCOUNT: -${symbol}${invoice.discountValue.toFixed(2)}`);
            }
        }

        // Free products discount
        if (invoice.ProductDiscountValue > 0) {
            encoder.bold(true).line(`-DISCOUNT (FREE PRODUCTS): ${currency} ${invoice.ProductDiscountValue.toFixed(2)}`).bold(false);
        }

        // Grand Total
        encoder.bold(true).line(`TOTAL: ${currency} ${invoice.grandTotal.toFixed(2)}`).bold(false);
        encoder.line("--------------------------------");

        // Payment Info
        encoder.bold(true).line(`PAYMENT: ${invoice.paymentMode.toUpperCase()}`).bold(false);
        encoder.line("");
    }

    // 7. Footer (Skipped if KOT)
    if (invoice?.BillType !== "KOT") {
        encoder.align("center");
        encoder.line("SAVE OUR NUMBER FOR OFFERS & MENU UPDATES");
        encoder.bold(true).line("THANK YOU");
        encoder.bold(false).line("FOR YOUR BUSINESS!");
    }

    // Feed and cutting commands
    encoder.newline().newline().newline().newline();
    encoder.cut();

    return encoder.encode();
}