'use client'
import moment from 'moment'
import React from 'react'
import { useSelector } from 'react-redux';
import { Roboto } from 'next/font/google';
import { CircleCheck } from 'lucide-react';
const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-roboto',
});

export default function PrintInvoiceFormate({ invoice }: { invoice: any }) {
    const { Company } = useSelector((state: any) => state.Company)
    const Branch = invoice?.branchId;
    let Address;


    if (Branch?.address) {
        Address = Branch?.address?.street + " " + Branch?.address?.city
    }

    return (
        <div className={` text-black uppercase bg-white ${roboto.variable}`}>
            <div className="flex justify-end">
                {invoice?.BillType == "KOT" ? (
                    <div className="flex flex-row">
                        <p className="text-xl font-bold">#</p>
                        <p className='text-xl font-bold'>{invoice?.BillType}</p>
                    </div>
                ) : ""}
            </div>
            {/* Header */}
            <div className="text-center mb-2">
                {
                    invoice?.BillType !== "KOT" &&
                    <div className="">
                        <h2 className="text-2xl font-bold">{invoice.companyName}</h2>
                        <h3 className='font-semibold'>{Company?.vatId || ''}</h3>

                        {
                            Address ?
                                <p className="text-sm font-semibold">{Address}</p>
                                :
                                <p className="text-sm font-semibold">{invoice.companyAddress}</p>

                        }
                        <div className="text-center mb-2 flex gap-1 justify-center">

                            <p className='text-sm font-semibold w-[15rem]'>
                                {Company?.phone}
                            </p>

                        </div>
                    </div>
                }

                <div className="text-sm font-bold mt-1">TAX INVOICE: {invoice.invoiceId}</div>
                <div className="text-sm font-semibold">
                    Date: {moment(invoice.issueDate).format('DD/MM/YYYY hh:mm A')}
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-2 border-t border-b border-gray-400 py-1 font-semibold">
                <p className="text-sm font-bold">Customer: {invoice.clientName}</p>
                <p className="text-sm">Phone: {invoice.clientPhone}</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-2">
                <thead>
                    <tr className="border-b border-gray-400">
                        <th className="text-left py-1">Item</th>
                        <th className="text-right py-1">Qty</th>
                        {
                            invoice?.BillType != "KOT" &&
                            <>
                                <th className="text-right py-1">Price</th>
                                <th className="text-right py-1">Total</th>
                            </>
                        }
                    </tr>
                </thead>
                <tbody>
                    {invoice.products.map((product: any, index: any) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="text-left py-1 mx-1 font-semibold flex flex-row">
                                {invoice?.BillType === "KOT" && product.kot_completed && (
                                    <CircleCheck />
                                )}
                                {product.name}
                                {
                                    product?.Specification && <p className="text-sm font-semibold">({product.Specification})</p>
                                }
                            </td>
                            <td className="text-right py-1 mr-3 font-semibold">{product.quantity}</td>
                            {
                                invoice?.BillType != "KOT" &&
                                <>
                                    <td className="text-right py-1 mx-1 font-semibold">{invoice.currency}{product.rate}</td>
                                    <td className="text-right py-1 mx-1 font-semibold">{invoice.currency}{product.amount}</td>
                                </>
                            }
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            {
                invoice?.BillType != "KOT" &&
                <div className="text-sm">
                    <div className="flex justify-between py-1 font-bold">
                        <span>Subtotal:</span>
                        <span>{invoice.currency} {invoice.subTotal.toFixed(2)}</span>
                    </div>

                    {invoice?.appliedTaxes?.map((tax: any, index: any) => (
                        <div key={index} className="flex justify-between py-1 font-semibold">
                            <span>{tax.taxName} ({tax.percentage}%):</span>
                            <span>{invoice.currency} {tax.amount.toFixed(2)}</span>
                        </div>
                    ))}
                    {
                        invoice?.isExempted &&
                        <div className="flex justify-between py-1">
                            <span>VAT(0%)</span>
                            <span className='uppercase'>Exempted</span>
                        </div>
                    }
                    {invoice.discountValue > 0 && (
                        <div className="flex justify-between text-sm border-t pt-2">
                            <span>Discount</span>
                            {
                                invoice.discountType == "percentage" ?
                                    <span>
                                        - {invoice.discountValue.toFixed(2)}%<br />
                                        -{Company.currency.symbol}{(Math.round(((invoice.subTotal + invoice.appliedTaxes.reduce((sum: number, tax: any) => sum + tax.amount, 0)) * invoice.discountValue) / 100 / 50) * 50).toFixed(2)}
                                    </span>
                                    :
                                    <span>
                                        -{Company.currency.symbol}{invoice.discountValue.toFixed(2)}
                                    </span>

                            }
                        </div>
                    )}
                    {invoice.ProductDiscountValue > 0 && (

                        <div className="flex justify-between border-t border-gray-400 pt-1 font-bold">
                            <span>-Discount (Free Products):</span>
                            <span>{invoice.currency} {invoice.ProductDiscountValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )
                    }

                    <div className="flex justify-between border-t border-gray-400 pt-1 font-bold">
                        <span>TOTAL:</span>
                        <span>{invoice.currency} {invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                </div>
            }

            {/* Payment Info */}
            {
                invoice?.BillType != "KOT" &&
                <div className="mt-2 text-sm">
                    <p className="font-bold">Payment: {invoice.paymentMode}</p>
                </div>
            }

            {/* Footer */}
            {
                invoice?.BillType !== "KOT" &&
                <div className="text-center mt-3 mb-1">
                    <p className='text-sm'>Save our number for offers & menu updates</p>
                    <p className="font-bold text-sm">THANK YOU</p>
                    <p className="text-sm font-semibold">For your business!</p>
                </div>
            }
        </div>
    )
}