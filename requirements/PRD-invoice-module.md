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
   - [US-INV-02: Material Selection — Grouping via Coil Accordions](#us-inv-02-material-selection--grouping-via-coil-accordions)
   - [US-INV-03: Material Selection — Per Piece vs. Per MT Pricing Toggle](#us-inv-03-material-selection--per-piece-vs-per-mt-pricing-toggle)
   - [US-INV-04: Material Selection — Leftover Coil Sales](#us-inv-04-material-selection--leftover-coil-sales)
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
 │    ├── Grouped by Coil (Accordion format to prevent decision fatigue)
 │    ├── Part Selection (Explicit radio toggle for "Per Piece" vs "Per MT" pricing)
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

### US-INV-03: Material Selection — Grouping via Coil Accordions

**As a** Billing Admin,  
**I want to** see available parts neatly grouped by their source coil (that I just selected),  
**So that** I don't suffer decision fatigue while locating specific items to invoice.

#### 4.3.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-010 | The Material Selection interface (Step 3) shall display **Collapsible Accordions** strictly for the coils selected in Step 2. | Must Have |
| INV-REQ-011 | The Accordion Header shall display key coil attributes (Coil No., Thickness, Width, Coating, Surface, and Grade) to allow for quick identification. | Must Have |
| INV-REQ-012 | Expanding a Coil accordion reveals a table of parts with columns: Checkbox (Select All), Part Name, Item Type (from WO), Width, Length (for sheets), Number of Pieces, and Weight. | Must Have |
| INV-REQ-013 | Accordions default to expanded if only one coil was selected. Default to collapsed if multiple coils exist to reduce visual clutter. | Should Have |
| INV-REQ-014 | Provide a "Select All" checkbox at the top of an expanded Coil table to select all parts from that coil simultaneously. | Should Have |

#### 4.3.2 Acceptance Criteria

- [ ] Step 3 only shows data for the parents isolated in Step 2.
- [ ] Material list does not flood the screen. Coils elegantly encapsulate their respective parts.
- [ ] The Accordion Header displays key coil attributes (Coil No., Thickness, Width, Coating, Surface, and Grade) to facilitate rapid identification.

---

### US-INV-04: Material Selection — Per Piece vs. Per MT Pricing Toggle

**As a** Billing Admin,  
**I want to** specify pricing explicitly either by unit count (Per Piece) or by weight (Per MT) using radio buttons when I select a part,  
**So that** the system dynamically adapts to my pricing logic without me needing to do external calculations.

#### 4.4.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-015 | When a user checks the checkbox for a specific part inside the Coil Accordion, an **expanded inline sub-row** is revealed with pricing configuration. | Must Have |
| INV-REQ-016 | The pricing configuration shall feature two explicit, clear radio buttons: **Pricing Mode: [ ] Per Piece [ ] Per MT**. | Must Have |
| INV-REQ-017 | **If "Per Piece" is selected**: The user inputs `No. of Pieces` and `Price per Piece`. <br/>*System auto-calculates*: Total Weight (Derived from piece proportion) and Total Price (`No. of pieces` × `Price per Piece`). | Must Have |
| INV-REQ-018 | **If "Per MT" is selected**: The user inputs `Weight to Invoice (in MT)` and `Price per MT`. <br/>*System auto-calculates*: Total Pieces (proportional to weight) and Total Price (`Weight` × `Price per MT`). | Must Have |
| INV-REQ-019 | The UI must make the non-relevant fields read-only according to the active radio button (e.g., if Per Piece is selected, Weight field cannot be typed in directly, it is greyed out/auto-computed). | Must Have |

#### 4.4.2 Acceptance Criteria

- [ ] Explicit radio buttons eliminate ambiguity on how an item is being billed.
- [ ] The line total calculates accurately immediately upon typing in the selected input constraints.

---

### US-INV-05: Material Selection — Leftover Coil Sales

**As a** Billing Admin,  
**I want to** have the option to directly sell the Leftover scrap/remainder from a coil, specifying exactly how much weight out of the leftover balance I am selling,  
**So that** scrap tracking isn't disconnected from the billing system.

#### 4.5.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| INV-REQ-020 | Inside every Coil Accordion, the final row of the parts table shall be designated as **"Leftover Coil"**. It shall lack dimensions and piece counts (N/A). | Must Have |
| INV-REQ-021 | When the Leftover Coil checkbox is checked, the expanded row displays ONLY weight-based input. | Must Have |
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
| FR-INV-03 | Grouping of items inside an accordion determined by Parent Coil identifier. | Must Have |
| FR-INV-04 | Radio-button driven dynamic inputs (Piece vs. MT) controlling which attribute auto-calculates. | Must Have |
| FR-INV-05 | Logic treating Leftover scrap differently from cut parts (No Piece radio button). | Must Have |
| FR-INV-06 | Full mathematical waterfall (Line totals → Subtotal → Add. Charges → Tax → Grand Total). | Must Have |
| FR-INV-07 | Linking UI shipping address to billing via singular checkbox. | Must Have |
| FR-INV-08 | PDF Generation capabilities upon transitioning to Issue status. | Must Have |

---

## 6. Calculation Specifications

### 6.1 Per Piece Pricing (Derived Weight)

When a cut sheet part is selected as **Per Piece**:

```javascript
// Known constraints via parent inventory:
per_piece_standard_weight_MT = total_parent_batch_weight_MT / total_parent_pieces

// User Inputs:
input_pieces = {user_value}
input_price_per_piece = {user_value}

// Auto Derived:
derived_weight_to_invoice_MT = input_pieces × per_piece_standard_weight_MT
line_total = input_pieces × input_price_per_piece
```

### 6.2 Per MT Pricing (Derived Pieces)

When a cut sheet part is selected as **Per MT**:

```javascript
// Known constraints via parent inventory:
per_piece_standard_weight_MT = total_parent_batch_weight_MT / total_parent_pieces

// User Inputs:
input_weight_MT = {user_value}
input_price_per_MT = {user_value}

// Auto Derived:
derived_pieces_to_invoice = (input_weight_MT / per_piece_standard_weight_MT) 
// User must be able to choose between rounding up (Ceiling) or rounding down (Floor) if result is fractional.
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
| NFR-INV-02 | The Accordion layout must smoothly manage lists of up to 50 parent coils on a single screen without crashing. | Scalability |
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
| `pricing_mode` | Enum | `PER_PIECE` or `PER_MT` |
| `billed_pieces` | Integer | Auto-derived if mode was PER_MT, else user input |
| `billed_weight_MT` | Number | Auto-derived if mode was PER_PIECE, else user input |
| `unit_rate` | Number | User input against the mode selection |
| `line_total` | Number | Calculated result |

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | When calculating derived pieces from weight (Per MT mode), if the maths returns a fraction (e.g. 10.4 pieces), should the system throw a validation block error, truncate to 10, or allow decimal piece fractions? | Business | **Closed**: User allowed to choose (Floor/Ceiling). |
| OQ-2 | Can multiple different tax rates apply simultaneously to distinct line items based on HSN codes, or is tax applied universally to the Net Total at the bottom? (Currently specified as universal). | Business | **Closed**: Global for now. Line-item tax is Future Scope. |
| OQ-3 | What determines standard pricing references? Should `Price per MT` pull from a master pricebook by default? | Product | **Closed**: Manual input for now. Master pricebook is Future Scope. |

---

## 11. Future Scope

- **Flexible Tax Application**: The system will eventually support a toggle in "Settings" to choose between **Line-Item Level Tax** (applying specific HSN/Tax rates per part) and **Global Tax** (applying a single rate to the entire Net Total). The current implementation focuses on Global Tax for simplicity.
- **Master Pricebook Integration**: Future versions will include the ability to pull default `Price per MT` or `Price per Piece` from a master pricebook/catalog based on grade/thickness/width, while still allowing for manual user overrides at the line-item level.

---
*Document End.*
