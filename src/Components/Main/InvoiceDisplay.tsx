'use client'
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { useSelector } from "react-redux";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import PrintInvoiceFormate from "./PrintInvoiceFormate";
import { printInvoice } from "@/lib/printer/escpos";


export default function InvoiceDisplay({ invoice }: { invoice: any }) {
    const { Company } = useSelector((state: any) => state.Company)
    const Branch = invoice?.branchId;
    const Address = Branch?.address.street + " " + Branch?.address.city + " " + Branch?.address.state

    const [isPrinting, setIsPrinting] = useState(false);
    const handlePrint = () => {
        setIsPrinting(true)
    };
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrintDocument = (event: React.MouseEvent) => {
        event.preventDefault();
        printInvoice(invoice, Company)
        setIsPrinting(false)
    };


    if (!invoice) return <div className="p-4 text-center text-gray-500 dark:text-gray-400">No invoice data available</div>;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isPrinting && invoice && (
                <div>
                    <Dialog open={isPrinting} onOpenChange={setIsPrinting}>
                        <DialogContent className="max-w-7xl w-full ">
                            <DialogTitle >Print Invoice</DialogTitle>
                            <div ref={invoiceRef} className="max-h-[80vh] overflow-auto bg-white rounded-lg">
                                <PrintInvoiceFormate invoice={invoice} />
                            </div>

                            <div className="flex justify-end my-4">
                                <Button
                                    onClick={handlePrintDocument}
                                    variant={'secondary'}
                                    className="cursor-pointer w-full"
                                    onKeyDown={(e) => e.key == "Enter" ? { handlePrintDocument } : ""}
                                >
                                    Print
                                </Button>

                            </div>
                        </DialogContent>
                    </Dialog>

                </div>

            )

            }
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="w-full sm:w-auto flex items-center gap-3">
                    <div className="w-full">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">
                            Invoice #{invoice.invoiceId}
                        </h1>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end gap-2">



                    <Button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Print</span>
                    </Button>
                    {/* <Button
                        onClick={handleDownload}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                    </Button> */}
                </div>
            </div>

            <div id="invoice-content">

                {/* Invoice Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300"
                >
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex flex-row justify-between">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">INVOICE</h2>

                                <div className="bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-6 py-3 rounded-lg font-bold text-lg">
                                    {invoice.invoiceId}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    {
                                        invoice?.BillType ?
                                            <div className="flex flex-row">
                                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100"> Bill Type : </p>
                                                <p className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                                                    {invoice?.BillType}
                                                </p>
                                            </div>
                                            : ""
                                    }
                                    <p className="font-medium text-gray-700 dark:text-gray-300">From:</p>
                                    <p className="text-lg text-gray-800 dark:text-gray-200">{invoice.companyName}</p>
                                    {
                                        Address ?
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{Address}</p>
                                            :
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.companyAddress}</p>
                                    }
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                    {Branch?.phone ? Branch?.phone : Company?.phone}
                                </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end space-y-4">
                                <div className="text-left md:text-right text-gray-500 dark:text-gray-400">
                                    <p className="font-medium">Date Issued:</p>
                                    <p>{moment(invoice.createdAt).format('DD/MM/YYYY HH:mm A')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Bill To:</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium text-lg">{invoice.clientName}</p>
                                <p className="text-gray-600 dark:text-gray-400">{invoice.clientPhone}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900">
                                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-right">QTY</th>
                                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-right">PRICE</th>
                                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-right">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {invoice.products.map((product: any, index: any) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="p-4 text-gray-800 dark:text-gray-200">{product.name}</td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200 text-right">{product.quantity}</td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200 text-right">{invoice.currency} {product.rate.toFixed(2)}</td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200 text-right font-medium">{invoice.currency} {product.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-900">
                                    <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                                        <td className="p-4 text-gray-700 dark:text-gray-300 font-medium" colSpan={3}>SUBTOTAL</td>
                                        <td className="p-4 text-gray-800 dark:text-gray-200 text-right font-bold">{invoice.currency} {invoice.subTotal.toFixed(2)}</td>
                                    </tr>
                                    {invoice?.appliedTaxes?.map((tax: any, index: any) => (
                                        <tr key={index}>
                                            <td className="p-4 text-gray-700 dark:text-gray-300" colSpan={3}>
                                                {tax.taxName} ({tax.percentage}%)
                                            </td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200 text-right">
                                                {invoice.currency} {tax.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {invoice?.isExempted && (
                                        <tr >
                                            <td className="p-4 text-gray-700 dark:text-gray-300" colSpan={3}>
                                                <span>VAT(0%)</span>
                                            </td>
                                            <td className="p-4 text-gray-800 uppercase dark:text-gray-200 text-right">
                                                Exempted
                                            </td>
                                        </tr>
                                    )}

                                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                        <td className="p-4 text-gray-800 dark:text-gray-100 font-bold text-lg" colSpan={3}>GRAND TOTAL</td>
                                        <td className="p-4 text-gray-800 dark:text-gray-100 font-bold text-lg text-right">{invoice.currency} {invoice.grandTotal.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="mt-8 space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Payment Information:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm dark:shadow-gray-900/50">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Mode</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{invoice.paymentMode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-8">
                                <div className="text-4xl sm:text-5xl font-bold text-gray-200 dark:text-gray-700 mb-2">THANK YOU</div>
                                <p className="text-gray-500 dark:text-gray-400">For your business!</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* User Details */}
                <div className='flex justify-start mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg shadow-sm dark:shadow-gray-900/50'>
                    <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 flex-wrap'>
                        {
                            invoice?.branchName && (
                                <div className='flex items-center gap-2'>
                                    <span className='text-gray-400 dark:text-gray-500'>Branch Name:</span>
                                    <p className='text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                                        {invoice?.branchName}
                                    </p>
                                </div>
                            )
                        }
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-400 dark:text-gray-500'>Created By:</span>
                            <p className='text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                                {invoice?.createdBy?.name}
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-400 dark:text-gray-500'>Email:</span>
                            <p className='text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                                {invoice?.createdBy?.email}
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-400 dark:text-gray-500'>Phone:</span>
                            <p className='text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                                {invoice?.createdBy?.phone}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}