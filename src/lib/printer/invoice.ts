import EscPosEncoder from "esc-pos-encoder";
import moment from "moment";

export function generateInvoice(invoice: any, companyFromRedux?: any) {
    const encoder = new EscPosEncoder();
    encoder.initialize();

    // Standard 3-inch (80mm) impact/thermal printers perfectly accommodate 40 characters per line.
    const LINE_WIDTH = 40;

    // Helper function to manually center text for a 40-character width
    const centerText = (text: string) => {
        const cleanText = text.trim().toUpperCase();
        if (cleanText.length >= LINE_WIDTH) return cleanText.substring(0, LINE_WIDTH);
        const spaces = Math.floor((LINE_WIDTH - cleanText.length) / 2);
        return " ".repeat(spaces) + cleanText;
    };

    // Helper to safely format left-aligned text with a 1-space margin to prevent physical margin clipping
    const leftText = (text: string) => {
        return " " + text.toUpperCase();
    };

    // Helper to build a perfect two-column row (Left text, Right text) fitting exactly 40 chars
    const formatRow = (left: string, right: string) => {
        const leftStr = " " + left.toUpperCase(); // 1 space left margin
        const rightStr = right.toUpperCase() + " "; // 1 space right margin
        const spaceLeft = LINE_WIDTH - leftStr.length - rightStr.length;

        if (spaceLeft > 0) {
            return leftStr + " ".repeat(spaceLeft) + rightStr;
        }
        return leftStr + "\n" + " ".repeat(LINE_WIDTH - rightStr.length) + rightStr;
    };

    // --- 1. KOT Top Indicator Header ---
    if (invoice?.BillType === "KOT") {
        encoder.align("right").bold(true).line(`#${invoice.BillType} `).bold(false);
    }

    // --- 2. Main Header (Skipped if KOT) ---
    if (invoice?.BillType !== "KOT") {
        encoder.align("left"); // Use left layout control but manual padding calculations for absolute precision

        encoder.bold(true).line(centerText(invoice.companyName));

        if (companyFromRedux?.vatId) {
            encoder.line(centerText(companyFromRedux.vatId));
        }

        // Branch address fallback logic
        const branch = invoice?.branchId;
        const address = branch?.address
            ? `${branch.address.street}, ${branch.address.city}`
            : invoice.companyAddress;

        if (address) {
            encoder.bold(false).line(centerText(address));
        }

        if (companyFromRedux?.phone) {
            encoder.line(centerText(`TEL: ${companyFromRedux.phone}`));
        }
        encoder.line("");
    }

    // --- 3. Tax Invoice Meta Info ---
    encoder.align("left");
    encoder.bold(true).line(centerText(`TAX INVOICE: ${invoice.invoiceId}`));
    encoder.bold(false).line(centerText(`DATE: ${moment(invoice.issueDate).format('DD/MM/YYYY hh:mm A')}`));
    encoder.line("");

    // --- 4. Customer Info ---
    encoder.line("-".repeat(LINE_WIDTH));
    encoder.bold(true).line(leftText(`CUSTOMER: ${invoice.clientName}`));
    encoder.bold(false).line(leftText(`PHONE: ${invoice.clientPhone || 'N/A'}`));
    encoder.line("-".repeat(LINE_WIDTH));

    // --- 5. Items Table ---
    invoice.products.forEach((product: any) => {
        let nameLine = "";
        if (invoice?.BillType === "KOT" && product.kot_completed) {
            nameLine += "[V] ";
        }
        nameLine += product.name;
        if (product?.Specification) {
            nameLine += ` (${product.Specification})`;
        }

        // Print Item Name
        encoder.bold(true).line(leftText(nameLine));
        encoder.bold(false);

        // Print Item Totals/Qty math below the name string layout
        if (invoice?.BillType === "KOT") {
            encoder.line(formatRow("", `QTY: ${product.quantity}`));
        } else {
            const currency = invoice.currency || "$";
            const qtyXRate = `${product.quantity} x ${currency}${product.rate}`;
            const totalAmount = `${currency}${product.amount}`;
            encoder.line(formatRow(qtyXRate, totalAmount));
        }
    });
    encoder.line("-".repeat(LINE_WIDTH));

    // --- 6. Totals & Financial Calculations (Skipped if KOT) ---
    if (invoice?.BillType !== "KOT") {
        const currency = invoice.currency || "$";
        const symbol = companyFromRedux?.currency?.symbol || currency;

        // Subtotal
        encoder.line(formatRow("SUBTOTAL:", `${currency}${invoice.subTotal.toFixed(2)}`));

        // Taxes
        invoice?.appliedTaxes?.forEach((tax: any) => {
            encoder.line(formatRow(`${tax.taxName} (${tax.percentage}%):`, `${currency}${tax.amount.toFixed(2)}`));
        });

        // Exempted VAT
        if (invoice?.isExempted) {
            encoder.line(formatRow("VAT(0%):", "EXEMPTED"));
        }

        // Discounts
        if (invoice.discountValue > 0) {
            if (invoice.discountType === "percentage") {
                const taxSum = invoice.appliedTaxes?.reduce((sum: number, tax: any) => sum + tax.amount, 0) || 0;
                const baseForDiscount = invoice.subTotal + taxSum;
                const computedDiscount = (Math.round((baseForDiscount * invoice.discountValue) / 100 / 50) * 50).toFixed(2);

                encoder.line(formatRow("DISCOUNT:", `-${invoice.discountValue.toFixed(2)}%`));
                encoder.line(formatRow("", `-${symbol}${computedDiscount}`));
            } else {
                encoder.line(formatRow("DISCOUNT:", `-${symbol}${invoice.discountValue.toFixed(2)}`));
            }
        }

        // Free products discount
        if (invoice.ProductDiscountValue > 0) {
            encoder.line(formatRow("DISCOUNT (FREE):", `${currency}${invoice.ProductDiscountValue.toFixed(2)}`));
        }

        // Grand Total
        encoder.bold(true).line(formatRow("TOTAL:", `${currency}${invoice.grandTotal.toFixed(2)}`)).bold(false);
        encoder.line("-".repeat(LINE_WIDTH));

        // Payment Info
        encoder.bold(true).line(leftText(`PAYMENT: ${invoice.paymentMode}`)).bold(false);
        encoder.line("");
    }

    // --- 7. Footer ---
    if (invoice?.BillType !== "KOT") {
        encoder.line(centerText("SAVE OUR NUMBER FOR OFFERS & MENU UPDATES"));
        encoder.bold(true).line(centerText("THANK YOU"));
        encoder.bold(false).line(centerText("FOR YOUR BUSINESS!"));
    }

    // Feed and cut execution
    encoder.newline().newline().newline().newline();
    encoder.cut();

    return encoder.encode();
}