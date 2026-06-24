'use client'
import BillingComponent from '@/Components/Main/CreateBill'
import PrintInvoiceFormate from '@/Components/Main/PrintInvoiceFormate';
import HeldInvoices from '@/Components/Other/HeldInvoices';

import { Button } from '@/Components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/Components/ui/dialog';
import { printInvoice } from '@/lib/printer/escpos';
import axios from 'axios';
import { Receipt } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';

export default function Page() {
    const [HoldInvoices, setHoldInvoices] = useState<any>(null);
    const [HoldInvoiceUpdate, setHoldInvoiceUpdate] = useState<any>(null)
    const [invoice, setInvoice] = useState<any>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const { Company } = useSelector((state: any) => state.Company)



    const FetchHoldInvoices = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/Invoice/fetchHoldInvoices`)
            if (data.success) {
                setHoldInvoices(data.invoices);
            }
        } catch (error) {
            return
        }
    }
    const invoiceRef = useRef<HTMLDivElement>(null);

    // const handlePrintDocument = (e?: React.MouseEvent<HTMLButtonElement>) => {
    //     e?.preventDefault();
    //     if (!invoiceRef.current) return;

    //     const iframe = document.createElement("iframe");

    //     iframe.style.display = "none";

    //     document.body.appendChild(iframe);

    //     const doc = iframe.contentWindow?.document;

    //     if (!doc) return;

    //     doc.open();
    //     doc.write(`
    //     <html>
    //     <head>
    //         ${Array.from(
    //         document.querySelectorAll('link[rel="stylesheet"], style')
    //     )
    //             .map(el => el.outerHTML)
    //             .join("")}
    //     </head>
    //      <body class="text-xs text-sm p-1 p-2>
    //         ${invoiceRef.current.outerHTML}
    //     </body>
    //     </html>
    // `);
    //     doc.close();

    //     iframe.onload = () => {
    //         iframe.contentWindow?.focus();
    //         iframe.contentWindow?.print();

    //         const cleanup = () => {
    //             document.body.removeChild(iframe);
    //             window.removeEventListener("afterprint", cleanup);
    //         };

    //         window.addEventListener("afterprint", cleanup);
    //     };
    // };

    const handlePrintDocument = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        printInvoice(invoice, Company)
        // if (invoiceRef.current) {
        //     const printContents = invoiceRef.current.innerHTML;
        //     const originalContents = document.body.innerHTML;
        //     document.body.innerHTML = printContents;
        //     window.print();
        //     document.body.innerHTML = originalContents;
        //     window.location.reload();
        // }
        // setIsPrinting(false);
    };
    useEffect(() => {
        FetchHoldInvoices()
    }, [])

    return (
        <div className=''>

            <BillingComponent HoldInvoiceUpdate={HoldInvoiceUpdate} setHoldInvoices={setHoldInvoices} FetchHoldInvoices={FetchHoldInvoices} />
            {
                HoldInvoices?.length > 0 && (
                    <HeldInvoices setShowInvoice={setShowInvoice} setInvoice={setInvoice} HoldInvoices={HoldInvoices} setHoldInvoiceUpdate={setHoldInvoiceUpdate} />
                )
            }
            {showInvoice && invoice && (
                <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
                    <DialogContent className="max-w-4xl w-full">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Receipt className="h-6 w-6" />
                            Invoice #{invoice.invoiceNumber}
                        </DialogTitle>
                        <div ref={invoiceRef} className="max-h-[70vh] overflow-auto p-4 border rounded-lg">
                            <PrintInvoiceFormate invoice={invoice} />
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                onClick={handlePrintDocument}
                                className="cursor-pointer px-8"
                                size="lg"
                            >
                                Print Invoice
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
