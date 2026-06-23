"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent } from "../ui/dialog";
import axios from "axios";
import { toast } from "react-toastify";
import { Percent } from "lucide-react";

import {
    Edit,
    Minus,
    Plus,
    PlusCircle,
    Trash2,
    X,
    Search,
    ArrowLeft,
    Receipt,
    Save,
    CreditCard,
    Calendar,
    Phone,
    User as UserIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/Components/ui/select";
import BillProductEdit from "../Other/BillProductEdit";
import { DialogTitle } from "@radix-ui/react-dialog";
import PrintInvoiceFormate from "./PrintInvoiceFormate";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ProductCardSkeleton from "../Skeleton/ProductCardCreateBill";
import { cn } from "@/lib/utils";
import { printInvoice } from "@/lib/printer/escpos";

interface Product {
    name: string;
    rate: number;
    quantity: number;
    amount: number;
    Specification: string;
    kot_completed?: boolean;
}

const ComplementProduct = {
    name: "Complement",
    price: 0,
    amount: 0,
    quantity: 1,
};

export default function BillingComponent({
    HoldInvoiceUpdate,
    setHoldInvoices,
    FetchHoldInvoices
}: {
    HoldInvoiceUpdate: any,
    setHoldInvoices: any
    FetchHoldInvoices: () => Promise<void>;
}) {
    const { User } = useSelector((state: any) => state.User);
    const { Company } = useSelector((state: any) => state.Company);
    const { Products } = useSelector((state: any) => state.Products);

    const dispatch = useDispatch();
    const [invoice, setInvoice] = useState<any>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [BillType, setBillType] = useState("BILL");
    const [clientName, setClientName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [productName, setProductName] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [productsList, setProductsList] = useState<any[]>([]);
    const [subTotal, setSubTotal] = useState<number>(0);
    const [grandTotal, setGrandTotal] = useState<number>(0);
    const [paymentMode, setPaymentMode] = useState<string>("cash");
    const [appliedTaxes, setAppliedTaxes] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [editProductPopUp, setEditProductPopUp] = useState(false);
    const [editProduct, setEditProduct] = useState({});
    const [HoldedInvoice, SetHoldedInvoice] = useState("");
    const [activeTab, setActiveTab] = useState("products");
    const [productCategories, setProductCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExempted, setIsExempted] = useState(false);
    const [ProductIsLoading, setProductIsLoading] = useState(true);
    const [discountType, setDiscountType] = useState("flat");
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [ProductDiscountValue, setProductDiscountValue] = useState<number>(0);


    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
    const searchRef = useRef<HTMLInputElement>(null);


    // Initial Data Fetch
    useEffect(() => {
        const fetchProduct = async () => {
            setProductIsLoading(true);
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/company/product/fetch`, { withCredentials: true });
                setFilteredProducts(data.products);
                setProductsList(data.products);
            } catch (error) {
                toast.error("Failed to fetch products");
            } finally {
                setProductIsLoading(false);
            }
        };
        fetchProduct();
        fetchTaxData();
    }, []);

    // Initial Hold Invoice Data
    useEffect(() => {
        if (HoldInvoiceUpdate) {
            SetHoldedInvoice(HoldInvoiceUpdate._id);
            setClientName(HoldInvoiceUpdate.clientName);
            setPhoneNumber(HoldInvoiceUpdate.clientPhone);
            setProducts(HoldInvoiceUpdate.products);
            setBillType(HoldInvoiceUpdate.BillType);
            setPaymentMode(HoldInvoiceUpdate.paymentMode);
        }
    }, [HoldInvoiceUpdate]);

    // Categories Logic
    useEffect(() => {
        if (productsList?.length > 0) {
            const categories = ["all", ...new Set(productsList.map((product: any) => product.category || "uncategorized"))];
            setProductCategories(categories);
        }
    }, [productsList]);

    // Combined Totals and Taxes Logic (Loop-Safe)
    useEffect(() => {
        // 1. Subtotal
        const newSubTotal = products.reduce((sum, p) => sum + p.amount, 0);
        setSubTotal(newSubTotal);

        // 2. Taxes
        const calculatedTaxes = taxes?.map((tax) => {
            const rawTax = newSubTotal * (tax.percentage / 100);
            // const rounded = Math.round(rawTax / 50) * 50;
            return {
                taxName: tax.taxName,
                percentage: tax.percentage,
                amount: parseFloat(rawTax.toFixed(1)),
            };
        }) || [];
        setAppliedTaxes(calculatedTaxes);

        // 3. Grand Total Calculation
        const totalTaxAmount = calculatedTaxes.reduce((sum, t) => sum + t.amount, 0);
        let currentGrandTotal = newSubTotal + totalTaxAmount;

        if (discountValue > 0) {
            if (discountType === "percentage") {
                const discountAmt = Math.round(((currentGrandTotal * discountValue) / 100) / 50) * 50;
                currentGrandTotal -= discountAmt;
            } else {
                currentGrandTotal -= discountValue;
            }
        }
        setGrandTotal(Number(currentGrandTotal.toFixed(2)));
    }, [products, taxes, discountValue, discountType]);

    const fetchTaxData = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/company/Tax/fetch`);
            setTaxes(data?.tax?.taxes || []);
        } catch (error) {
            toast.error("Failed to fetch taxes");
        }
    };

    useEffect(() => {
        if (isExempted) setTaxes([]);
        else fetchTaxData();
    }, [isExempted]);


    //  search and filter logic combined with category filtering
    const handleProductSearch = useCallback((searchTerm: string, categoryOverride?: string) => {
        setProductName(searchTerm);

        setHighlightedIndex(1);
        const activeCategory = categoryOverride !== undefined ? categoryOverride : selectedCategory;
        let filtered = productsList;

        if (activeCategory && activeCategory !== "all") {
            filtered = filtered.filter((p: any) => (p.category || "uncategorized") === activeCategory);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((p: any) =>
                p.name.toLowerCase().includes(term) || p.product_number?.toString().includes(term)
            );
        }
        setFilteredProducts(filtered);
    }, [productsList, selectedCategory]);

    const handleKOTToggle = (index: number, checked: boolean) => {
        setProducts(prev =>
            prev.map((product, i) =>
                i === index ? { ...product, kot_completed: checked } : product
            )
        );
        toast.info(
            checked ? `Marked ${products[index].name} as completed` : `Marked ${products[index].name} as pending`,
            { position: "bottom-right", autoClose: 1000, hideProgressBar: true }
        );
    };

    // useEffect(() => {
    //     const handleKeyDown = (e: KeyboardEvent) => {
    //         // Ignore shortcuts
    //         if (e.ctrlKey || e.metaKey || e.altKey) return;

    //         // Ignore if already typing in input
    //         if (document.activeElement === searchRef.current) return;

    //         // Match letters and numbers
    //         if (/^[a-zA-Z0-9]$/.test(e.key)) {
    //             e.preventDefault();

    //             searchRef.current?.focus();

    //             const value = e.key;

    //             setProductName(value);
    //             handleProductSearch(value);
    //         }
    //     };

    //     window.addEventListener("keydown", handleKeyDown);

    //     return () => {
    //         window.removeEventListener("keydown", handleKeyDown);
    //     };
    // }, [handleProductSearch]);

    const ClearSearch = useCallback(() => {
        setProductName("");
        handleProductSearch("", selectedCategory); // keep active category, just clear text
        searchRef.current?.focus();
    }, [handleProductSearch, selectedCategory]);

    const AddProduct = useCallback((product: any) => {
        setProducts(prev => {
            const existing = prev.find((p) => p.name === product.name);
            if (existing) {
                return prev.map((p) =>
                    p.name === product.name
                        ? { ...p, quantity: p.quantity + 1, amount: (p.quantity + 1) * p.rate }
                        : p
                );
            }
            return [...prev, {
                name: product.name,
                rate: product.price || 0,
                quantity: 1,
                amount: product.price || 0,
                Specification: product.Specification || "",
                kot_completed: product.kot_completed || false,
            }];
        });
        toast.success(`Added ${product.name}`, { position: "bottom-right", autoClose: 1000, hideProgressBar: true });
        ClearSearch();
    }, [ClearSearch]);

    const handleDelete = (index: number) => {
        const deletedProduct = products[index];
        setProducts(products.filter((_, i) => i !== index));
        toast.info(`Removed ${deletedProduct.name}`, { position: "bottom-right", autoClose: 1000, hideProgressBar: true });
    };

    const handleProductEdit = (product: any, index: number) => {
        setEditProductPopUp(true);
        setEditProduct({ product, index });
    };

    const handleQuantityChange = (product: Product, value: number) => {
        setProducts(prev => {
            return prev.map((p) => {
                if (p.name === product.name) {
                    const newQty = p.quantity + value;
                    if (newQty <= 0) return null;
                    return { ...p, quantity: newQty, amount: newQty * p.rate };
                }
                return p;
            }).filter(Boolean) as Product[];
        });
    };

    // show the product Discount if any product name ends with "free"
    useEffect(() => {
        const freeProducts = products.filter((product) =>
            product.name.toLowerCase().endsWith("(free)")
        );

        const totalRate = freeProducts
            .reduce((sum, product) => sum + (product.amount), 0);

        const totalAppliedTax = taxes.reduce((sum, tax) => sum + tax.percentage, 0);

        const totalWithTax = totalRate + (totalRate * totalAppliedTax) / 100;
        setProductDiscountValue(totalWithTax);
        setGrandTotal((prev) => Number((prev - totalWithTax).toFixed(2)));
    }, [products, taxes]);

    const Reset = () => {
        SetHoldedInvoice("");
        setClientName("");
        setPhoneNumber("");
        setProducts([]);
        setSubTotal(0);
        setGrandTotal(0);
        setBillType("BILL");
        setPaymentMode("cash");
        setDiscountValue(0);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        handleProductSearch(productName, category);
    };

    const invoiceRef = useRef<HTMLDivElement>(null);


    const handlePrintDocument = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        printInvoice(invoice, Company)
    };




    const CreateInvoice = async () => {
        if (products.length === 0) return toast.error("Please add products");
        if (BillType !== "KOT" && !paymentMode) return toast.error("Select payment mode");
        if (User?.role === "Owner" && !selectedBranch && !HoldedInvoice) return toast.error("Select branch");

        try {
            setIsProcessing(true);
            const totalTaxAmount = appliedTaxes.reduce((sum, tax) => sum + tax.amount, 0).toFixed(2);
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/Invoice/create`, {
                clientName, phoneNumber, products, subTotal, grandTotal, paymentMode,
                appliedTaxes, totalTaxAmount, BillType, selectedBranch, HoldedInvoice,
                InvoiceStatus: "Done", discountValue, discountType, isExempted, ProductDiscountValue
            });

            if (data.invoice) {
                setInvoice(data.invoice);
                setShowInvoice(true);
                setHoldInvoices((prev: any) => prev.filter((i: any) => i._id !== data.invoice._id));
                Reset();
            }
        } catch (error) {
            toast.error("Invoice creation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const HoldInvoice = async () => {
        if (!clientName) return toast.error("Enter Client Name");
        if (products.length === 0) return toast.error("Add at least one product");

        try {
            setIsProcessing(true);
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/Invoice/create`, {
                clientName, phoneNumber, products, subTotal, grandTotal, paymentMode,
                appliedTaxes, totalTaxAmount: appliedTaxes.reduce((s, t) => s + t.amount, 0),
                BillType, selectedBranch, InvoiceStatus: "Hold", discountValue, discountType, isExempted, ProductDiscountValue
            });

            if (data.invoice) {
                setHoldInvoices((prev: any) => [...prev, data.invoice]);
                Reset();
                toast.success("Invoice placed on hold");
            }
        } catch (error) {
            toast.error("Failed to hold invoice");
        } finally {
            setIsProcessing(false);
        }
    };

    const HandleKOT = async () => {
        if (!clientName) return toast.error("Enter Client Name");
        if (products.length === 0) return toast.error("Add products");

        try {
            setIsProcessing(true);
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/Invoice/create`, {
                clientName, phoneNumber, products, subTotal, grandTotal, paymentMode,
                appliedTaxes, totalTaxAmount: appliedTaxes.reduce((s, t) => s + t.amount, 0),
                BillType, selectedBranch, HoldedInvoice, InvoiceStatus: "Hold", discountValue, discountType,
                ProductDiscountValue
            });

            if (data.invoice) {
                setInvoice(data.invoice);

                setShowInvoice(true);
                if (!HoldedInvoice) setHoldInvoices((prev: any) => [...prev, data.invoice]);
                Reset();
                axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/kot/save`, { Invoice: data.invoice }, { withCredentials: true });
            }
            await FetchHoldInvoices();
        } catch (error) {
            toast.error("KOT creation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setHighlightedIndex(p => p < filteredProducts.length ? p + 1 : 0);
            } else if (e.key === "ArrowUp") {
                setHighlightedIndex(p => p > 0 ? p - 1 : 0);
            } else if (e.key === "Enter" && highlightedIndex > 0) {
                AddProduct(filteredProducts[highlightedIndex - 1]);
            }
            itemRefs.current[highlightedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [highlightedIndex, filteredProducts, AddProduct]);


    useEffect(() => {
        if (editProductPopUp) {
            setHighlightedIndex(0);
        }
    }, [editProductPopUp]);


    return (
        <div className="container mx-auto pb-8">
            {/* Invoice Dialog */}
            {showInvoice && invoice && (
                <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
                    <DialogContent className="max-w-4xl w-full">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Receipt className="h-6 w-6" /> Invoice #{invoice.invoiceId}
                        </DialogTitle>
                        <div ref={invoiceRef} className="max-h-[70vh] overflow-auto p-4 border rounded-lg bg-white">
                            <PrintInvoiceFormate invoice={invoice} />
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handlePrintDocument} className="px-8" size="lg">Print Invoice</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Link href="/Dashboard">
                        <Button variant="outline" className="flex gap-2 items-center">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold ml-4">Billing System</h1>
                </div>
                {HoldedInvoice && <Badge variant="outline" className="px-3 py-1">Editing Held Invoice</Badge>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                {/* Left Panel: Customer Info */}
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle className="text-xl flex items-center gap-2"><UserIcon className="h-5 w-5" /> Customer</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input placeholder="Customer Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                        <Input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        {User?.role === "Owner" && Company?.branch?.length > 0 && !HoldedInvoice && (
                            <Select onValueChange={setSelectedBranch}>
                                <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                <SelectContent>
                                    {Company.branch.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.branchName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm"><input type="radio" checked={BillType === "BILL"} onChange={() => setBillType("BILL")} /> Bill</label>
                            <label className="flex items-center gap-2 text-sm"><input type="radio" checked={BillType === "KOT"} onChange={() => setBillType("KOT")} /> KOT</label>
                        </div>

                        {BillType !== "KOT" && (

                            <div className="space-y-1">

                                <label className="text-sm font-medium">Payment Mode</label>

                                <div className="relative ">

                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                                    <select

                                        className="w-full dark:bg-gray-950 p-2 pl-10 border rounded-md bg-white appearance-none"

                                        onChange={(e) => setPaymentMode(e.target.value)}

                                        value={paymentMode}

                                    >

                                        <option value="cash">Cash</option>

                                        <option value="upi">UPI</option>

                                        <option value="card">Card</option>

                                        <option value="netBanking">Net Banking</option>

                                        <option value="cheque">Cheque</option>

                                    </select>

                                </div>

                            </div>

                        )}
                        <div className="pt-4 border-t space-y-2">
                            <label className="text-sm font-medium">Discount</label>
                            <div className="flex gap-2">
                                <Button variant={discountType === "percentage" ? "default" : "outline"} size="sm" onClick={() => setDiscountType("percentage")}>%</Button>
                                <Button variant={discountType === "value" ? "default" : "outline"} size="sm" onClick={() => setDiscountType("value")}>Flat</Button>
                            </div>
                            <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={isExempted} onChange={(e) => setIsExempted(e.target.checked)} /> Exempted
                        </label>
                    </CardContent>
                </Card>

                {/* Middle Panel: Product Selection */}

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl">Products</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs
                            defaultValue="products"
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-2 mb-4">
                                <TabsTrigger value="products">Products</TabsTrigger>
                                <TabsTrigger value="categories">Categories</TabsTrigger>
                            </TabsList>

                            {/* ── Products Tab ── */}
                            <TabsContent value="products" className="space-y-3">

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        ref={searchRef}
                                        placeholder="Search products…"
                                        value={productName}
                                        onChange={(e) => handleProductSearch(e.target.value)}
                                        className="pl-10 pr-9"
                                        aria-label="Search products"
                                    />
                                    {productName && (
                                        <button
                                            onClick={ClearSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Active category filter badge */}
                                {selectedCategory && selectedCategory !== "all" && (
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                                            onClick={() => handleCategoryChange("all")}
                                        >
                                            <span className="capitalize">
                                                {selectedCategory === "uncategorized" ? "Other" : selectedCategory}
                                            </span>
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    </div>
                                )}

                                {/* Product grid */}
                                <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[380px] pr-1">

                                    {/* Complement tile */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => AddProduct(ComplementProduct)}
                                        onKeyDown={(e) => e.key === "Enter" && AddProduct(ComplementProduct)}
                                        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-4 cursor-pointer transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <PlusCircle className="h-8 w-8 text-blue-500" />
                                        <span className="text-sm font-medium">Complement</span>
                                        <span className="text-xs text-muted-foreground">
                                            {Company?.currency?.symbol}0.00
                                        </span>
                                    </div>

                                    {/* Skeletons while loading */}
                                    {ProductIsLoading &&
                                        [...Array(5)].map((_, i) => (
                                            <ProductCardSkeleton key={i} />
                                        ))}

                                    {/* Product cards */}
                                    {!ProductIsLoading &&
                                        filteredProducts?.map((product: any, index: number) => (
                                            <div
                                                key={product.id ?? index}
                                                ref={(el: any) => (itemRefs.current[index + 1] = el)}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => AddProduct(product)}
                                                onKeyDown={(e) => e.key === "Enter" && AddProduct(product)}
                                                className={cn(
                                                    "rounded-lg border bg-card p-3 shadow-sm cursor-pointer transition-all",
                                                    "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                    index + 1 === highlightedIndex
                                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                                                        : "border-border"
                                                )}
                                            >
                                                {/* Name row */}
                                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                    {product.product_number && (
                                                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">
                                                            {product.product_number}
                                                        </span>
                                                    )}
                                                    <h3 className="text-sm font-medium leading-snug line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </div>

                                                {/* Price */}
                                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {Company?.currency?.symbol}{product.price.toFixed(2)}
                                                </p>

                                                {/* Category badge */}
                                                {product.category && (
                                                    <Badge variant="outline" className="mt-1.5 text-xs">
                                                        {product.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}

                                    {/* Empty state */}
                                    {!ProductIsLoading && filteredProducts?.length === 0 && (
                                        <div className="col-span-2 py-10 flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="h-6 w-6 opacity-40" />
                                            <p className="text-sm">No products found</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* ── Categories Tab ── */}
                            <TabsContent value="categories">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[430px]">
                                    {productCategories.map((category, index) => (
                                        <div
                                            key={index}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                                handleCategoryChange(category);
                                                setActiveTab("products");
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleCategoryChange(category);
                                                    setActiveTab("products");
                                                }
                                            }}
                                            className={cn(
                                                "rounded-lg border p-3 cursor-pointer transition-all",
                                                "flex items-center justify-center text-center text-sm font-medium capitalize",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                selectedCategory === category
                                                    ? "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-300"
                                                    : "bg-card border-border hover:bg-muted"
                                            )}
                                        >
                                            {category === "uncategorized" ? "Other" : category}
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>


                {/* Right Panel: Summary */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" /> Bill Summary
                            </span>
                            {products.length > 0 && (
                                <Badge variant="secondary" className="px-2 py-1">
                                    {products.length} {products.length === 1 ? "item" : "items"}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {products.length === 0 ? (
                            <div className="text-center py-12 px-4 border border-dashed rounded-lg">
                                <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                                <p className="mt-4 text-gray-500">No products added to the bill yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="max-h-[280px] pr-1 overflow-y-auto " >
                                    {products.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between border-b py-3 h-auto relative">

                                            <div className="flex justify-center items-center gap-1">
                                                {BillType === "KOT" && (
                                                    <Input
                                                        name="kot_completed"
                                                        type="checkbox"
                                                        className="size-5 cursor-pointer"
                                                        checked={product.kot_completed || false}
                                                        onChange={(e) => handleKOTToggle(index, e.target.checked)}
                                                    />
                                                )}
                                                <p className="font-medium">{product.name}</p>
                                                {
                                                    product?.Specification && <p className="text-sm">({product.Specification})</p>
                                                }
                                                {BillType !== "KOT" && (
                                                    <p className="text-sm text-gray-500">{Company.currency.symbol}{product.rate.toFixed(2)} each</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7 cursor-pointer rounded-full"
                                                    onClick={() => handleQuantityChange(product, -1)}
                                                >
                                                    <Minus className="size-4" />
                                                </Button>

                                                <span className=" text-center">{product.quantity}</span>

                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7 cursor-pointer rounded-full"
                                                    onClick={() => handleQuantityChange(product, 1)}
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {BillType !== "KOT" && (
                                                    <span className="text-right w-fit font-medium">
                                                        {Company?.currency?.symbol}{product.amount.toFixed(2)}
                                                    </span>
                                                )}

                                                <div className="flex gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 cursor-pointer text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                        onClick={() => handleProductEdit(product, index)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>


                                {BillType !== "KOT" && (
                                    <div className="space-y-3 pt-3 border-t">

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>{Company.currency.symbol}{subTotal.toFixed(2)}</span>
                                        </div>
                                        {appliedTaxes?.map((tax, index) => (

                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {tax.taxName} ({tax.percentage}%)
                                                </span>
                                                <span>{Company.currency.symbol}{tax.amount}</span>
                                            </div>

                                        ))}
                                        {isExempted && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    VAT(0%)
                                                </span>
                                                <span className="uppercase">Exempted</span>
                                            </div>
                                        )}

                                        {appliedTaxes.length > 0 && (
                                            <div className="flex justify-between text-sm border-t pt-2">
                                                <span>Total Tax</span>
                                                <span>
                                                    +{Company.currency.symbol}{appliedTaxes?.reduce((sum, tax) => sum + tax.amount, 0)}
                                                </span>
                                            </div>
                                        )}


                                        {discountValue > 0 && (
                                            <div className="flex justify-between text-sm border-t pt-2">
                                                <span>Discount</span>
                                                {
                                                    discountType == "percentage" ?
                                                        <span>
                                                            - {discountValue.toFixed(2)}%<br />
                                                            -{Company.currency.symbol}{(Math.round(((subTotal + appliedTaxes.reduce((sum, tax) => sum + tax.amount, 0)) * discountValue) / 100 / 50) * 50).toFixed(2)}
                                                        </span>
                                                        :
                                                        <span>
                                                            -{Company.currency.symbol}{discountValue.toFixed(2)}
                                                        </span>
                                                }
                                            </div>
                                        )}
                                        {ProductDiscountValue > 0 && (
                                            <div className="flex justify-between text-sm border-t pt-2">
                                                <span>Discount (Free Products):</span>

                                                <span>
                                                    - {Company.currency.symbol}{ProductDiscountValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>

                                            </div>
                                        )}

                                        <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                            <span>Grand Total</span>
                                            <span>{Company.currency.symbol}{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>

                                    </div>
                                )}
                                {BillType == "KOT" ?
                                    <div className="flex flex-col gap-2 pt-3">
                                        <Button
                                            onClick={HandleKOT}
                                            variant="outline"
                                            disabled={products.length === 0 || clientName === "" || isProcessing}
                                            className="cursor-pointer w-full py-5 text-base flex gap-2 items-center"
                                        >
                                            <Save className="h-4 w-4" /> Continue
                                        </Button>
                                    </div>
                                    :
                                    <div className="flex flex-col gap-2 pt-3">
                                        <Button
                                            onClick={CreateInvoice}
                                            disabled={
                                                products.length === 0 ||
                                                (BillType !== "KOT" && paymentMode === "") ||
                                                isProcessing
                                            }
                                            className="cursor-pointer w-full py-6 text-base"
                                        >
                                            {isProcessing ? "Processing..." : "Create Invoice"}
                                        </Button>

                                        <Button
                                            onClick={HoldInvoice}
                                            variant="outline"
                                            disabled={products.length === 0 || clientName === "" || isProcessing}
                                            className="cursor-pointer w-full py-5 text-base flex gap-2 items-center"
                                        >
                                            <Save className="h-4 w-4" /> Hold Invoice
                                        </Button>
                                    </div>
                                }

                                <span className="text-red-600 cursor-pointer" onClick={Reset}>Reset</span>
                            </>
                        )}

                    </CardContent>
                </Card>
            </div>

            <Dialog open={editProductPopUp} onOpenChange={setEditProductPopUp}>
                <DialogContent>
                    <DialogTitle>Edit Product Details</DialogTitle>
                    <BillProductEdit setEditProductPopUp={setEditProductPopUp} editProduct={editProduct} setProducts={setProducts} />
                </DialogContent>
            </Dialog>
        </div>
    );
}