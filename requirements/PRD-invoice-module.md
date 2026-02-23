# Product Requirements Document
# Invoice Module — Steel Coil Processing ERP

**Version:** 1.0  
**Date:** February 22, 2026  
**Status:** Draft  
**Author:** Product Team  
**Reviewers:** Development, QA, Business Users

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Personas & Actors](#2-personas--actors)
3. [Module Architecture Summary](#3-module-architecture-summary)
4. [User Stories & Requirements](#4-user-stories--requirements)
   - [US-INV-01: Create Invoice — Details Validation](#us-inv-01-create-invoice--details-validation)
   - [US-INV-02: Material Selection — Grid & Details View](#us-inv-02-material-selection--grid--details-view)
   - [US-INV-03: Material Selection — Flat Parts List & Mandatory Details](#us-inv-03-material-selection--flat-parts-list--mandatory-details)
   - [US-INV-04: Material Selection — Pricing by Weight (Per MT) Only](#us-inv-04-material-selection--pricing-by-weight-per-mt-only)
   - [US-INV-04B: Material Selection — Leftover Coil Sales](#us-inv-04b-material-selection--leftover-coil-sales)
   - [US-INV-05: Calculations — Charges & Taxes](#us-inv-05-calculations--charges--taxes)
   - [US-INV-06: Payment and Terms](#us-inv-06-payment-and-terms)
   - [US-INV-07: Review & Issue Invoice](#us-inv-07-review--issue-invoice)
   - [US-INV-08: Invoice Lifecycle & Listing](#us-inv-08-invoice-lifecycle--listing)
5. [Functional Requirements Summary](#5-functional-requirements-summary)
6. [Calculation Specifications](#6-calculation-specifications)
7. [Validation Rules](#7-validation-rules)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data Model Notes](#9-data-model-notes)
10. [Open Questions](#10-open-questions)
11. [Future Scope](#11-future-scope)

---

## 1. Overview & Purpose

The Invoice Module enables business users to bill customers for goods prepared via Work Orders (or independently). Due to the complex nature of coil processing (where a single coil yields various cuts, slits, and leftover scraps), material selection is highly simplified to prevent decision fatigue while maintaining 100% accuracy in stock and price.

A core imperative of this module is **extreme simplicity**. Users can invoice multiple materials derived from different parent coils, pick whether to charge by the piece or by weight, structure additional handling charges, apply relevant taxes, and generate the final PDF Invoice.

---

## 2. Personas & Actors

| Persona | Role | Key Goals |
|---|---|---|
| **Sales / Billing Admin** | Invoice Creator | Quickly select the right materials, set accurate pricing, generate invoice error-free |
| **Plant Manager** | Oversight | Monitor dispatched weights vs. billed weights |
| **Customer (End User)** | Recipient | Receives a clean, legible PDF invoice |

---

## 3. Module Architecture Summary

```
Invoice Creation (5-Step Wizard)
 ├── Step 1: Invoice Details (Header, Logistics, Addressing)
 ├── Step 2: Coil Selection (Searchable grid, column filtering, lazy load)
 ├── Step 3: Material Selection (Parts from selected Coils)
 │    ├── Selected Coils Detail Grid (Grade, Thickness, Width, Surface, Coating, Current Weight)
 │    ├── Flat Parts Selection Table (No accordions to reduce clutter)
 │    └── Leftover Coil weight sale
 ├── Step 4: Charges and Tax
 │    ├── Extradited charges (transport, packing)
 │    └── Tax selection (SGST, CGST, IGST)
 └── Step 5: Payment and Terms

Invoice Lifecycle
 Draft → Issued → Paid
```

---

## 4. User Stories & Requirements

---

### US-INV-01: Create Invoice — Details Validation

**As a** Billing Admin,  
**I want to** capture all preliminary invoice details (whether pulling from an existing Sales Order or creating manually),  
**So that** the logistics, references, and address mapping are correctly documented for e-way bills and the customer.

#### 4.1.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-001 | On initial creation, provide two macro options: **Create Invoice from Sales Order** or **Create Invoice Manually**. | Must Have |
| INV-REQ-002 | If "From Sales Order", the **Order No.** field acts as a dropdown populated with eligible open orders. If manual, it is a manual text entry. | Must Have |
| INV-REQ-003 | Step 1 shall capture: Order No., Due Date, Order Date, PO No., Payment Terms, E-way Bill Number, Billing Address, Shipping Address. | Must Have |
| INV-REQ-004 | Shipping Address section shall include a **"Same as Billing Address"** checkbox. When checked, the shipping fields auto-populate and remain locked. | Must Have |

#### 4.1.2 Acceptance Criteria

- [ ] Selecting "From Sales Order" converts the Order No. field into a searchable dropdown.
- [ ] Toggling the "Same as Billing Address" checkbox instantly mirrors the billing text to shipping fields.
- [ ] Required fields block progression to Step 2 if left null.

---

### US-INV-02: Coil Selection — Finding Sources

**As a** Billing Admin,  
**I want to** select which parent coils I am invoicing against from a comprehensive, searchable list,  
**So that** I don't have to hunt through hundreds of distinct cuts and can filter down to the exact batch quickly.

#### 4.2.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-005 | Step 2 shall be a dedicated **Coil Selection** screen displaying a data grid of all available coils in inventory. | Must Have |
| INV-REQ-006 | The grid must support **lazy loading** or pagination to gracefully handle thousands of coil records without performance degradation. | Must Have |
| INV-REQ-007 | Users shall be able to perform a global **search** (e.g., by Coil No. or Customer Ref) across the dataset. | Must Have |
| INV-REQ-008 | Users shall be able to apply **column filtering** (e.g., filter by specific weights, grades, or inward dates). | Must Have |
| INV-REQ-009 | The user selects coils by checking a row-level checkbox. Selected coils are carried forward to the next step. | Must Have |

#### 4.2.2 Acceptance Criteria

- [ ] The UI renders quickly even with massive datasets thanks to lazy load.
- [ ] Search and column filtering operate directly on the dataset to isolate specific coils instantly.
- [ ] Only coils checked in this step dictate which accordions appear in Step 3.

---

### US-INV-03: Material Selection — Flat Parts List & Mandatory Details

**As a** Billing Admin,  
**I want to** review selected parent coils in a clear grid summary and see all their available parts in a sleek flat table below,  
**So that** I don't see cluttered accordions while entering prices, but still maintain extreme clarity over which cut belongs to which parent coil.

#### 4.3.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-010 | The Material Selection interface (Step 3) shall display a **Selected Coils** top grid providing a summary of parent coils, explicitly showing: Grade, Thickness, Width, Surface, Coating, Current Weight. | Must Have |
| INV-REQ-011 | Beneath the Selected Coils Grid, a single flat table shall list all child parts belonging to selected coils. | Must Have |
| INV-REQ-012 | **Sheet-based parts** (Cutting, Slit+Cut) shall mandatorily display: Part Name, Width, Length, Weight. | Must Have |
| INV-REQ-013 | **Slit-based parts** (Slitting) shall mandatorily display: Part Name, Width, Weight. | Must Have |
| INV-REQ-014 | **Leftover Coil** parts shall mandatorily display: Part Name, Width, Weight. | Must Have |
| INV-REQ-014B | The Parts List must group or display a 'Coil No.' column natively to allow users to quickly identify parent relations. No accordions will be utilized for this feature. | Must Have |

#### 4.3.2 Acceptance Criteria

- [ ] All parent coil details are neatly stored in a separate data grid, removing vertical height from the pricing configurations.
- [ ] Sheet-based, slit-based, and leftover parts map to their appropriate dimension fields.
- [ ] No accordions exist on the screen to prevent click fatigue.

---

### US-INV-04: Material Selection — Pricing by Weight (Per MT) Only

**As a** Billing Admin,  
**I want to** explicitly price all invoiced parts per MT (per metric ton), entering the number of pieces sold and allowing the system to back-calculate the invoiced weight based on unit weight,  
**So that** I do not have to double-enter weights for uniformly cut/slit segments. *Note: "Price per Piece" billing is strictly Out of Scope for the initial release but is planned for future customer implementation [customer name: JGI].*

#### 4.4.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-015 | When a user checks the checkbox for a specific part in the flat table, an **expanded inline sub-row** is revealed with pricing parameters. | Must Have |
| INV-REQ-016 | For physically discrete pieces (Slit-based and Sheet-based): The user shall input `No. of Pieces` and `Price per MT`. | Must Have |
| INV-REQ-017 | Taking the inputted Pieces, the system auto-calculates Total Weight (`Pieces` × `Unit Weight of Part`) and renders it as read-only. | Must Have |
| INV-REQ-018 | Line Total is calculated dynamically as `Auto-calculated Total Weight` × `Price per MT`. | Must Have |

#### 4.4.2 Acceptance Criteria

- [ ] Users do not choose between Pricing Modes (no toggles).
- [ ] The line total calculates accurately immediately upon typing in the pieces.

---

### US-INV-04B: Material Selection — Leftover Coil Sales

**As a** Billing Admin,  
**I want to** have the option to directly sell the Leftover scrap/remainder from a coil, specifying exactly how much weight out of the leftover balance I am selling,  
**So that** scrap tracking isn't disconnected from the billing system.

#### 4.5.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-020 | Inside the parts table list, the final row for any given parent coil shall be designated as **"Leftover Coil"**. It inherently lacks discrete piece counts. | Must Have |
| INV-REQ-021 | When the Leftover Coil checkbox is checked, the expanded row displays ONLY weight-based input (`Weight to Invoice` instead of `Pieces`). | Must Have |
| INV-REQ-022 | Leftover Input shall require: `Weight to be Invoiced (MT)` and `Price per MT`. Total price is auto-calculated. | Must Have |
| INV-REQ-023 | The invoiced weight cannot exceed the actual leftover weight available for that specific coil. Show inline error if exceeded. | Must Have |

#### 4.5.2 Acceptance Criteria

- [ ] "Leftover Coil" appears distinctly in the table beneath cut pieces.
- [ ] The pricing logic for leftover scrap does not show the "Per Piece" radio button.
- [ ] Over-billing scrap weight prevents the user from proceeding to the next step.


---

### US-INV-06: Calculations — Charges & Taxes

**As a** Billing Admin,  
**I want to** apply handling fees, transportation, packing charges, and select the correct tax rates on top of the selected subtotal,  
**So that** the final grand total is legally and logistically accurate.

#### 4.6.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-024 | Step 4 (Charges and Tax) shall display a read-only list of all selected materials, their billed weight, and line totals for a quick cross-check. | Must Have |
| INV-REQ-025 | The user shall input flat numeric values for Additional Charges: Transportation Charges, Handling Charges, Packing Charges, Other Charges. | Must Have |
| INV-REQ-026 | Provide a dropdown to select the overall Tax Rate configuration (e.g., CGST/SGST at 18%, or IGST at 18%). | Must Have |
| INV-REQ-027 | A "Pricing and Charges" summary panel shall live-calculate: <br> - Subtotal (Sum of all material line totals) <br> - Additional Charges (Sum of all 4 extra charge inputs) <br> - Net Total (`Subtotal` + `Additional Charges`) <br> - Tax Amount (calculated based on selected tax rate applied to Net Total) <br> - Round Off <br> - Grand Total (`Net Total` + `Tax Amount` + `Round Off`) | Must Have |

#### 4.5.2 Acceptance Criteria

- [ ] Material subtotal correctly transfers from Step 2.
- [ ] Additional charges add perfectly into the Net Total before taxes are applied.
- [ ] Changing the tax select dropdown instantly reshuffles the tax split (e.g. 9% CGST + 9% SGST vs 18% IGST) and value.

---

### US-INV-07: Payment and Terms

**As a** Billing Admin,  
**I want to** freely insert the invoice's governing payment terms and banking details,  
**So that** the customer knows exactly how and when to clear the liability.

#### 4.7.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-028 | Step 5 shall provide a rich-text or formatted text area for Payment Terms and Banking Info. | Must Have |
| INV-REQ-029 | If "From Sales Order", inherit terms from the parent SO by default (user override permitted). | Must Have |

---

### US-INV-08: Review & Issue Invoice

**As a** Billing Admin,  
**I want to** review the entire invoice payload on a final summary screen before hitting submit,  
**So that** I don't send malformed invoices to high-profile clients.

#### 4.8.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-030 | Step 6 (or final click action) presents a comprehensive read-only review of Invoice Details, Selected Materials, and Grand Totals. | Must Have |
| INV-REQ-031 | CTAs include **Save as Draft**, **Previous**, and **Submit**. | Must Have |
| INV-REQ-032 | Upon Submit, status transitions to `Issued`, an Invoice Number is permanently locked to the document, and a success screen is displayed. | Must Have |
| INV-REQ-033 | The success screen shall offer CTAs: **View Full Invoice (PDF format)** and **Go to List**. | Must Have |

---

### US-INV-09: Invoice Lifecycle & Listing

**As a** Billing Admin,  
**I want to** manage my invoices through a list interface, tracking payments and outstanding drafts,  
**So that** revenue operations are centralized.

#### 4.9.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-034 | The List UI displays: Invoice No., Invoice Date,Due Date, Order No., Customer Name, Line Status (Draft / Issued / Paid), Total Value. | Must Have |
| INV-REQ-035 | A "Mark as Paid" CTA is accessible on the individual Invoice Detail screen for any invoice in `Issued` status. | Must Have |

---

## 5. Functional Requirements Summary

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-INV-01 | Step-by-step creation wizard featuring Draft persistence. | Must Have |
| FR-INV-02 | Coil Selection Step supporting searchable, filterable grid with lazy-loading payload logic. | Must Have |
| FR-INV-03 | Coil details display separately in a master grid, while a flat layout holds billable line-items. | Must Have |
| FR-INV-04 | Logic for handling discrete pieces (auto-calculating MT weight based on entered piece count). | Must Have |
| FR-INV-05 | Logic treating Leftover scrap differently from cut parts (direct weight entry). | Must Have |
| FR-INV-06 | Full mathematical waterfall (Line totals → Subtotal → Add. Charges → Tax → Grand Total). | Must Have |
| FR-INV-07 | Linking UI shipping address to billing via singular checkbox. | Must Have |
| FR-INV-08 | PDF Generation capabilities upon transitioning to Issue status. | Must Have |

---

## 6. Calculation Specifications

### 6.1 Standard Weight Calculation (Per MT Mode)

When a slitting, cutting, or slit cut part is selected:

```javascript
// Known constraints via parent inventory:
per_piece_standard_weight_MT = batch_unit_weight // (e.g. 0.02 MT per sheet)

// User Inputs:
input_pieces = {user_value}
input_price_per_MT = {user_value}

// Auto Derived:
derived_weight_to_invoice_MT = input_pieces × per_piece_standard_weight_MT
line_total = derived_weight_to_invoice_MT × input_price_per_MT
```

### 6.2 Leftover Weight Calculation

When a leftover item is selected:

```javascript
// User Inputs:
input_weight_MT = {user_value}
input_price_per_MT = {user_value}

// Auto Derived:
line_total = input_weight_MT × input_price_per_MT
```

### 6.3 Waterfall Total

```javascript
Subtotal = sum(line_total_array)
Net_Total = Subtotal + Transport_Chg + Handling_Chg + Packing_Chg + Other_Chg
Tax_Value = Net_Total × (Selected_Tax_Rate_Pct / 100)
Raw_Grand_Total = Net_Total + Tax_Value

// Round off to nearest whole number if standard accounting applies
Round_Off_Delta = Math.round(Raw_Grand_Total) - Raw_Grand_Total
Final_Grand_Total = Math.round(Raw_Grand_Total)
```

---

## 7. Validation Rules

| Rule | Condition | Message |
|---|---|---|
| V-INV-01 | Selected Invoice Weight > Available Inventory Weight for Part/Coil | "You cannot invoice more weight than is available in stock." |
| V-INV-02 | Selected Pieces > Available Pieces for Part | "You cannot invoice more pieces than exist in this batch." |
| V-INV-03 | Missing mandatory addressing in Step 1 | "Billing Address and Due Date are mandatory." |
| V-INV-04 | No materials selected going into Step 3 | "At least one item must be checked for invoicing." |

---

## 8. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-INV-01 | Inline pricing input line calculations react within 100ms. | Performance |
| NFR-INV-02 | Lists of up to 50 parent coils on a single screen must be manageable without lag. | Scalability |
| NFR-INV-03 | PDF layouts must print crisply on standard A4 layout. | UI/UX |

---

## 9. Data Model Notes

### Invoice Entity (Key Fields)

| Field | Type | Notes |
|---|---|---|
| `invoice_id` | UUID | Auto-generated |
| `status` | Enum | Draft, Issued, Paid |
| `so_ref` | UUID | Nullable (if Manual) |
| `due_date` | Date | User entry |
| `billing_details` | Object | JSON block housing address/tax ID |
| `items` | Array<Object> | Array of billed items including pricing mode flag |
| `charges_payload` | Object | `{ transport, packing, handling, other }` |
| `tax_payload` | Object | `{ type: 'CGST_SGST', rate: 18.0 }` |

### Invoice Item Payload (Array subset)

| Field | Type | Notes |
|---|---|---|
| `part_id` | UUID | Reference to specific stock / cut |
| `is_leftover` | Boolean | Flags scrap vs finished sheet |
| `billed_pieces` | Integer | User input (if not leftover) |
| `billed_weight_MT` | Number | Auto-derived (or user input if leftover) |
| `unit_rate_MT` | Number | User input price per metric ton |
| `line_total` | Number | Calculated result |

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Can multiple different tax rates apply simultaneously to distinct line items based on HSN codes, or is tax applied universally to the Net Total at the bottom? (Currently specified as universal). | Business | **Closed**: Global for now. Line-item tax is Future Scope. |
| OQ-2 | What determines standard pricing references? Should `Price per MT` pull from a master pricebook by default? | Product | **Closed**: Manual input for now. Master pricebook is Future Scope. |

---

## 11. Future Scope

- **Flexible Tax Application**: The system will eventually support a toggle in "Settings" to choose between **Line-Item Level Tax** (applying specific HSN/Tax rates per part) and **Global Tax** (applying a single rate to the entire Net Total). The current implementation focuses on Global Tax for simplicity.
- **Master Pricebook Integration**: Future versions will include the ability to pull default `Price per MT` from a master pricebook/catalog based on grade/thickness/width, while still allowing for manual user overrides at the line-item level.
- **Per-Piece Pricing for JGI**: Integration of a dedicated **Per Piece** pricing flow to support customer JGI. Currently deferred to future phases to keep baseline billing purely weight-driven.

---
*Document End.*
