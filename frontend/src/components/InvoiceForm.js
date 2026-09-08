import React, { useState } from "react";

function InvoiceForm({ business, template }) {

    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");

    const [items, setItems] = useState([
        {
            type: "",
            width: "",
            height: "",
            nosSft: "",
            rate: "",
            amount: 0
        }
    ]);

    // If no template is selected, show everything
    const show = (field) => {
        if (!template) {
            return true;
        }

        return template[field] === true;
    };

    // Add new item
    const addItem = () => {
        setItems([
            ...items,
            {
                type: "",
                width: "",
                height: "",
                nosSft: "",
                rate: "",
                amount: 0
            }
        ]);
    };

    // Remove item
    const removeItem = (index) => {

        if (items.length === 1) {
            return;
        }

        setItems(items.filter((_, i) => i !== index));
    };

    // Update item
    const updateItem = (index, field, value) => {

        const updatedItems = [...items];

        updatedItems[index][field] = value;

        // Calculate amount
        const width =
            parseFloat(updatedItems[index].width) || 0;

        const height =
            parseFloat(updatedItems[index].height) || 0;

        const nosSft =
            parseFloat(updatedItems[index].nosSft) || 0;

        const rate =
            parseFloat(updatedItems[index].rate) || 0;

        let amount = 0;

        if (width > 0 && height > 0 && rate > 0) {
            amount = width * height * nosSft * rate;
        }

        updatedItems[index].amount = amount;

        setItems(updatedItems);
    };

    // Calculate total
    const total = items.reduce(
        (sum, item) =>
            sum + (parseFloat(item.amount) || 0),
        0
    );

    // Save invoice
    const saveInvoice = () => {

        console.log("Business:", business);
        console.log("Template:", template);

        console.log("Customer Name:", customerName);
        console.log("Phone:", phone);
        console.log("Items:", items);
        console.log("Total:", total);

        alert("Invoice saved successfully!");
    };

    // Download PDF
    const downloadPDF = () => {

        alert(
            `PDF will use template: ${
                template
                    ? template.templateName
                    : "Default Invoice"
            }`
        );
    };

    return (
        <div className="container">

            {/* ================= INVOICE BOX ================= */}

            <div
                className="bg-white p-4"
                style={{
                    borderTop: "3px solid #0d6efd",
                    borderRadius: "15px",
                    boxShadow:
                        "0 10px 30px rgba(0,0,0,0.12)"
                }}
            >

                {/* ================= TEMPLATE INFO ================= */}

                {template && (
                    <div
                        className="alert alert-success mb-4"
                        style={{
                            borderRadius: "10px"
                        }}
                    >
                        <strong>
                            Template:
                        </strong>{" "}
                        {template.templateName}
                    </div>
                )}

                {/* ================= CUSTOMER DETAILS ================= */}

                {(show("showCustomerName") ||
                    show("showCustomerPhone")) && (

                    <div className="row mb-3">

                        {/* Customer Name */}

                        {show("showCustomerName") && (
                            <div className="col-md-6">

                                <label className="fw-bold">
                                    Customer Name
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>
                        )}

                        {/* Customer Phone */}

                        {show("showCustomerPhone") && (
                            <div className="col-md-6">

                                <label className="fw-bold">
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>
                        )}

                    </div>
                )}

                {/* ================= ITEMS ================= */}

                {(show("showProduct") ||
                    show("showQuantity") ||
                    show("showRate") ||
                    show("showAmount")) && (

                    <>
                        <h4 className="text-primary mb-2">
                            Items
                        </h4>

                        {items.map((item, index) => (

                            <div
                                key={index}
                                className="border rounded p-3 mb-3 bg-light"
                            >

                                <div className="row g-2">

                                    {/* PRODUCT / TYPE */}

                                    {show("showProduct") && (
                                        <div className="col-md-3">

                                            <label className="form-label">
                                                Product
                                            </label>

                                            <select
                                                className="form-select"
                                                value={item.type}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "type",
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Select Product
                                                </option>

                                                <option value="UPVC Sheet">
                                                    UPVC Sheet
                                                </option>

                                                <option value="Glass">
                                                    Glass
                                                </option>

                                                <option value="Sealant">
                                                    Sealant
                                                </option>

                                            </select>

                                        </div>
                                    )}

                                    {/* QUANTITY */}

                                    {show("showQuantity") && (
                                        <>

                                            {/* Width */}

                                            <div className="col-md-2">

                                                <label className="form-label">
                                                    Width
                                                </label>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Width"
                                                    value={item.width}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "width",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </div>

                                            {/* Height */}

                                            <div className="col-md-2">

                                                <label className="form-label">
                                                    Height
                                                </label>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Height"
                                                    value={item.height}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "height",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </div>

                                            {/* Nos/Sft */}

                                            <div className="col-md-2">

                                                <label className="form-label">
                                                    Nos/Sft
                                                </label>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Nos/Sft"
                                                    value={item.nosSft}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "nosSft",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </>
                                    )}

                                    {/* RATE */}

                                    {show("showRate") && (
                                        <div className="col-md-2">

                                            <label className="form-label">
                                                Rate
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Rate"
                                                value={item.rate}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "rate",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>
                                    )}

                                    {/* AMOUNT */}

                                    {show("showAmount") && (
                                        <div className="col-md-2">

                                            <label className="form-label">
                                                Amount
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item.amount.toFixed(2)}
                                                readOnly
                                            />

                                        </div>
                                    )}

                                </div>

                                {/* Remove Button */}

                                <button
                                    type="button"
                                    className="btn btn-danger w-100 mt-2"
                                    onClick={() =>
                                        removeItem(index)
                                    }
                                    disabled={items.length === 1}
                                >
                                    🗑 Remove
                                </button>

                            </div>
                        ))}

                        {/* Add Item */}

                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={addItem}
                        >
                            + Add Item
                        </button>
                    </>
                )}

                {/* ================= TOTAL ================= */}

                {show("showTotal") && (
                    <div className="text-end mt-4">

                        <h4>
                            Total: ₹{total.toFixed(2)}
                        </h4>

                    </div>
                )}

                {/* ================= BUTTONS ================= */}

                <div className="d-flex justify-content-between mt-4">

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={saveInvoice}
                    >
                        💾 Save Invoice
                    </button>

                    <button
                        type="button"
                        className="btn btn-warning"
                        onClick={downloadPDF}
                    >
                        ⬇ Download PDF
                    </button>

                </div>

            </div>

        </div>
    );
}

export default InvoiceForm;