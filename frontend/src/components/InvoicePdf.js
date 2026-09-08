import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice, company) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const currency = invoice.currency || company?.currency || "₹";
    const primaryColor = [13, 110, 253]; // Royal Blue
    const darkColor = [33, 37, 41];
    const grayColor = [108, 117, 125];

    const pageWidth = doc.internal.pageSize.getWidth();

    // ================= HEADER SECTION =================
    // Accent Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 5, "F");

    let yPos = 18;

    // Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(company?.name || "Company Name", 14, yPos);

    // INVOICE Title on Right
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("INVOICE", pageWidth - 14, yPos, { align: "right" });

    yPos += 7;

    // Company contact info (left)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

    if (company?.address) {
        const splitAddress = doc.splitTextToSize(company.address, 90);
        doc.text(splitAddress, 14, yPos);
        yPos += splitAddress.length * 4;
    }

    if (company?.phone) {
        doc.text(`Phone: ${company.phone}`, 14, yPos);
        yPos += 4;
    }
    if (company?.email) {
        doc.text(`Email: ${company.email}`, 14, yPos);
        yPos += 4;
    }
    if (company?.gstin) {
        doc.text(`GSTIN: ${company.gstin}`, 14, yPos);
        yPos += 4;
    }

    // Invoice Meta (right)
    let metaY = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Invoice #: ${invoice.invoiceNumber || ""}`, pageWidth - 14, metaY, { align: "right" });

    metaY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Invoice Date: ${invoice.invoiceDate || ""}`, pageWidth - 14, metaY, { align: "right" });

    if (invoice.dueDate) {
        metaY += 4;
        doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - 14, metaY, { align: "right" });
    }

    metaY += 4;
    doc.setFont("helvetica", "bold");
    const statusText = (invoice.status || "DRAFT").toUpperCase();
    if (statusText === "PAID") {
        doc.setTextColor(25, 135, 84); // Green
    } else {
        doc.setTextColor(13, 110, 253);
    }
    doc.text(`Status: ${statusText}`, pageWidth - 14, metaY, { align: "right" });

    yPos = Math.max(yPos, metaY) + 8;

    // Divider
    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);

    yPos += 6;

    // ================= BILL TO SECTION =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("BILL TO:", 14, yPos);

    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(invoice.customerName || "Customer Name", 14, yPos);

    yPos += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

    if (invoice.customerPhone) {
        doc.text(`Phone: ${invoice.customerPhone}`, 14, yPos);
        yPos += 4;
    }
    if (invoice.customerEmail) {
        doc.text(`Email: ${invoice.customerEmail}`, 14, yPos);
        yPos += 4;
    }
    if (invoice.customerGstin) {
        doc.text(`GSTIN: ${invoice.customerGstin}`, 14, yPos);
        yPos += 4;
    }
    if (invoice.customerAddress) {
        const splitCustAddress = doc.splitTextToSize(invoice.customerAddress, 100);
        doc.text(splitCustAddress, 14, yPos);
        yPos += splitCustAddress.length * 4;
    }

    yPos += 4;

    // ================= TABLE ITEMS =================
    const tableColumns = [
        { header: "#", dataKey: "index" },
        { header: "Item Description", dataKey: "description" },
        { header: "Dimensions / Qty", dataKey: "dimensionOrQty" },
        { header: `Rate (${currency})`, dataKey: "rate" },
        { header: `Amount (${currency})`, dataKey: "amount" }
    ];

    const tableRows = (invoice.items || []).map((item, idx) => {
        let dimText = "";
        if (item.width && item.height) {
            dimText = `${item.width} x ${item.height} (${item.nosSft || 1} nos)`;
        } else {
            dimText = `${item.quantity || 1} ${item.unit || "pcs"}`;
        }

        let desc = item.productName || "";
        if (item.description) {
            desc += `\n${item.description}`;
        }

        return {
            index: idx + 1,
            description: desc,
            dimensionOrQty: dimText,
            rate: (parseFloat(item.rate) || 0).toFixed(2),
            amount: (parseFloat(item.amount) || 0).toFixed(2)
        };
    });

    autoTable(doc, {
        startY: yPos,
        columns: tableColumns,
        body: tableRows,
        theme: "striped",
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "left"
        },
        columnStyles: {
            index: { halign: "center", cellWidth: 10 },
            description: { cellWidth: 80 },
            dimensionOrQty: { halign: "center", cellWidth: 35 },
            rate: { halign: "right", cellWidth: 30 },
            amount: { halign: "right", cellWidth: 30 }
        },
        margin: { left: 14, right: 14 },
        styles: {
            fontSize: 9,
            cellPadding: 3
        }
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // ================= TOTALS & SUMMARY =================
    const summaryX = pageWidth - 75;
    const valueX = pageWidth - 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

    // Subtotal
    doc.text("Subtotal:", summaryX, yPos);
    doc.text(`${currency}${(parseFloat(invoice.subtotal) || 0).toFixed(2)}`, valueX, yPos, { align: "right" });
    yPos += 5;

    // Discount
    if (invoice.discountAmount > 0) {
        doc.text("Discount:", summaryX, yPos);
        doc.text(`-${currency}${(parseFloat(invoice.discountAmount) || 0).toFixed(2)}`, valueX, yPos, { align: "right" });
        yPos += 5;
    }

    // Tax
    if (invoice.taxAmount > 0) {
        doc.text(`Tax (${invoice.taxRate || 18}%):`, summaryX, yPos);
        doc.text(`${currency}${(parseFloat(invoice.taxAmount) || 0).toFixed(2)}`, valueX, yPos, { align: "right" });
        yPos += 5;
    }

    // Shipping
    if (invoice.shippingFee > 0) {
        doc.text("Shipping / Extra:", summaryX, yPos);
        doc.text(`${currency}${(parseFloat(invoice.shippingFee) || 0).toFixed(2)}`, valueX, yPos, { align: "right" });
        yPos += 5;
    }

    // Grand Total Divider & Line
    doc.setDrawColor(200, 200, 200);
    doc.line(summaryX, yPos, valueX, yPos);
    yPos += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Total Amount:", summaryX, yPos);
    doc.text(`${currency}${(parseFloat(invoice.totalAmount) || 0).toFixed(2)}`, valueX, yPos, { align: "right" });

    // ================= BANK & PAYMENT DETAILS =================
    let bankY = doc.lastAutoTable.finalY + 8;
    if (company?.bankName || company?.accountNumber || company?.upiId) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text("Bank & Payment Details:", 14, bankY);
        bankY += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

        if (company?.bankName) {
            doc.text(`Bank: ${company.bankName}`, 14, bankY);
            bankY += 4;
        }
        if (company?.accountNumber) {
            doc.text(`A/C No: ${company.accountNumber}`, 14, bankY);
            bankY += 4;
        }
        if (company?.ifscCode) {
            doc.text(`IFSC: ${company.ifscCode}`, 14, bankY);
            bankY += 4;
        }
        if (company?.upiId) {
            doc.text(`UPI ID: ${company.upiId}`, 14, bankY);
            bankY += 4;
        }
    }

    // ================= TERMS & FOOTER =================
    yPos = Math.max(yPos + 10, bankY + 8);

    if (invoice.terms || company?.invoiceTerms) {
        const termsText = invoice.terms || company?.invoiceTerms;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text("Terms & Conditions:", 14, yPos);
        yPos += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        const splitTerms = doc.splitTextToSize(termsText, 120);
        doc.text(splitTerms, 14, yPos);
    }

    // Authorized Signature line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("For " + (company?.name || "Company"), pageWidth - 14, yPos + 10, { align: "right" });
    doc.text("Authorized Signatory", pageWidth - 14, yPos + 22, { align: "right" });
    doc.line(pageWidth - 55, yPos + 18, pageWidth - 14, yPos + 18);

    // Save File
    const fileName = `Invoice_${invoice.invoiceNumber || "draft"}.pdf`;
    doc.save(fileName);
};
