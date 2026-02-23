# Product Requirements Document
# Supplier Portal — Steel Coil Processing ERP

**Version:** 1.0  
**Date:** February 23, 2026  
**Status:** Draft  
**Author:** Product Team  
**Reviewers:** Development, QA, Business Users

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Personas & Actors](#2-personas--actors)
3. [Module Architecture Summary](#3-module-architecture-summary)
4. [User Stories & Requirements](#4-user-stories--requirements)
   - [US-SP-01: RFQ Listing — Supplier View](#us-sp-01-rfq-listing--supplier-view)
   - [US-SP-02: RFQ Details — Supplier View](#us-sp-02-rfq-details--supplier-view)
   - [US-SP-03: Submit Quote](#us-sp-03-submit-quote)
   - [US-SP-04: View Submitted Quotes — Customer View](#us-sp-04-view-submitted-quotes--customer-view)
5. [Functional Requirements Summary](#5-functional-requirements-summary)
6. [Calculation Specifications](#6-calculation-specifications)
7. [Validation Rules](#7-validation-rules)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Open Questions](#9-open-questions)
10. [Future Scope](#10-future-scope)

---

## 1. Overview & Purpose

The Supplier Portal provides an external-facing interface for suppliers to view RFQs (Requests for Quotation) they have been invited to respond to and submit competitive quotes. On the internal side, it allows the customer (Enjen AI user) to review all received quotes in a structured, read-only comparison view.

The core design principle is **simplicity and speed** — suppliers must be able to review an RFQ and submit a complete quote with minimal friction, while the customer gets a clean, structured comparison across all competing suppliers.

---

## 2. Personas & Actors

| Persona | Role | Key Goals |
|---|---|---|
| **Supplier** | External Portal User | View RFQs assigned to them, submit quotes with pricing and delivery details |
| **Procurement / Purchase Admin** | Internal Enjen User | Review submitted quotes across suppliers in a structured comparison view |

---

## 3. Module Architecture Summary

```
Supplier Portal
 ├── RFQ Listing (Supplier View)
 │    └── All RFQs where supplier is mentioned
 ├── RFQ Details (Supplier View)
 │    └── Existing RFQ Details implementation (read-only)
 │         └── CTA: Submit Quote → opens Quote Submission Side-Panel
 └── Quote Submission Side-Panel
      ├── RFQ Summary Header (read-only)
      ├── Line Items (mandatory, per-item pricing inputs)
      ├── Quote-Level Details (Shipping, Tax, T&C)
      └── Price Waterfall (Subtotal → Shipping → Tax → Discount → Grand Total)

Internal View (Enjen AI)
 └── View Quotes (per RFQ)
      └── Supplier Comparison Listing
           └── Accordion: Per-Supplier Quote Detail Grid
```

---

## 4. User Stories & Requirements

---

### US-SP-01: RFQ Listing — Supplier View

**As a** Supplier,  
**I want to** see all RFQs I have been invited to quote on,  
**So that** I can quickly identify open opportunities and their deadlines.

#### 4.1.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| SP-REQ-001 | The RFQ Listing page shall display all RFQs where the logged-in supplier is mentioned. | Must Have |
| SP-REQ-002 | The listing design shall follow the standard Enjen listing screen pattern: search box, column selector, no primary CTA. | Must Have |
| SP-REQ-003 | Columns displayed: RFQ Number, Issue Date, Due Date, Special Instructions, Approx Value, Status, Payment Terms. | Must Have |

#### 4.1.2 Acceptance Criteria

- [ ] Only RFQs linked to the authenticated supplier are visible.
- [ ] Search and column filtering work correctly on the listing.
- [ ] Clicking any row navigates to the RFQ Details view.

---

### US-SP-02: RFQ Details — Supplier View

**As a** Supplier,  
**I want to** review the full details of a specific RFQ before committing to a quote,  
**So that** I have complete context on what is being requested.

#### 4.2.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| SP-REQ-004 | The RFQ Details view shall reuse the existing RFQ Details page implementation (read-only). | Must Have |
| SP-REQ-005 | A **"Submit Quote"** CTA shall be available at the bottom-right of the RFQ Details view. | Must Have |
| SP-REQ-006 | Clicking "Submit Quote" opens the Quote Submission Side-Panel. | Must Have |

#### 4.2.2 Acceptance Criteria

- [ ] RFQ Details render correctly in the supplier context.
- [ ] "Submit Quote" CTA is accessible from the details view.
- [ ] Side-panel opens without navigating away from the details view.

---

### US-SP-03: Submit Quote

**As a** Supplier,  
**I want to** submit a detailed quote covering all line items with pricing, delivery, and commercial terms,  
**So that** the customer can evaluate my offer against other suppliers.

#### 4.3.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| SP-REQ-007 | The Quote Submission Side-Panel shall display a **read-only RFQ Summary Header**: RFQ No., Created On, Due Date, Approx Value, Special Instructions, Status. | Must Have |
| SP-REQ-008 | All RFQ line items shall be presented as **mandatory accordions** — the supplier must quote every item; no line item may be skipped. | Must Have |
| SP-REQ-009 | Each Line Item accordion shall display the following **read-only** information: Item Code, Description, Quantity, UoM, Attachments (with View and Download support). | Must Have |
| SP-REQ-010 | Each Line Item accordion shall expose the following **editable** pricing fields: Item Price, Lead Time (Days), Price Validity Date, Delivery Date, Discount %, Notes. | Must Have |
| SP-REQ-011 | Quote-level fields shall be provided for: Shipping Cost, Tax Selection, Terms & Conditions. | Must Have |
| SP-REQ-012 | A **price waterfall summary** shall live-calculate and display: Subtotal, Shipping Cost, Taxes, Discounts, Grand Total. | Must Have |
| SP-REQ-013 | A **"Submit Quote to Customer"** CTA shall submit the completed quote. | Must Have |

#### 4.3.2 Acceptance Criteria

- [ ] All line items are mandatory; the submit action is blocked until all items have a valid Item Price entered.
- [ ] Read-only line item fields (Item Code, Description, Qty, UoM) cannot be edited by the supplier.
- [ ] Attachments within each line item are viewable and downloadable.
- [ ] Price waterfall updates live as the supplier enters pricing and shipping data.
- [ ] On successful submission, the quote is stored and becomes visible in the customer's "View Quotes" panel.
- [ ] **First Submission is Final**: Suppliers cannot edit or re-submit a quote once it has been sent to the customer in this version.

---

### US-SP-04: View Submitted Quotes — Customer View

**As a** Procurement Admin,  
**I want to** review all submitted quotes for a given RFQ in a comparison listing,  
**So that** I can evaluate supplier offers side-by-side before making a sourcing decision.

#### 4.4.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| SP-REQ-014 | A **"View Quotes"** button shall be accessible on the RFQ detail page within Enjen AI (internal user view). | Must Have |
| SP-REQ-015 | "View Quotes" opens a listing screen showing one row per supplier who has submitted a quote. Columns: Supplier, Total Quote Value, Late Delivery Charges *(from RFQ)*, Payment Terms *(from RFQ)*. | Must Have |
| SP-REQ-016 | No selection or action is available on this listing — it is read-only for comparison purposes. | Must Have |
| SP-REQ-017 | Clicking a supplier row expands an **accordion** showing the full quote detail grid for that supplier. | Must Have |
| SP-REQ-018 | The quote detail accordion grid shall display: Item Code, Quantity, UoM, Item Price, Lead Time Days, Price Validity Date, Delivery Date, Discount %. | Must Have |
| SP-REQ-019 | Below the line item grid, the accordion shall display the quote-level summary: Subtotal, Shipping Charges, Tax, Discount, Grand Total. | Must Have |

#### 4.4.2 Acceptance Criteria

- [ ] Only quotes that have been submitted (not in-progress) appear in the listing.
- [ ] Expanding a supplier row accurately reflects all data submitted by that supplier.
- [ ] Late Delivery Charges and Payment Terms are sourced from the RFQ, not the quote.
- [ ] No edit or selection actions are available to the customer on this screen.

---

## 5. Functional Requirements Summary

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-SP-01 | Supplier-scoped RFQ Listing using existing Enjen listing screen pattern. | Must Have |
| FR-SP-02 | Quote Submission Side-Panel with mandatory per-line-item pricing inputs. | Must Have |
| FR-SP-03 | Read-only line item details (Item Code, Description, Qty, UoM, Attachments) pre-populated from RFQ. | Must Have |
| FR-SP-04 | Attachment viewing and downloading from within line item accordions. | Must Have |
| FR-SP-05 | Live price waterfall calculation (Subtotal → Shipping → Tax → Discount → Grand Total). | Must Have |
| FR-SP-06 | All-item mandatory validation blocking submission if any line item's Item Price is missing. | Must Have |
| FR-SP-07 | Internal "View Quotes" read-only supplier comparison listing with expandable accordion per supplier. | Must Have |

---

## 6. Calculation Specifications

### 6.1 Line Item Total

```javascript
// Per line item:
line_subtotal = item_price * quantity
line_discounted = line_subtotal * (1 - (discount_pct / 100))

// Summed across all line items:
subtotal = sum(line_discounted_array)
```

### 6.2 Quote Price Waterfall

```javascript
subtotal          = sum of all line item discounted totals
shipping_cost     = {supplier input}
tax_amount        = (subtotal + shipping_cost) × (selected_tax_rate / 100)
total_discount    = sum(line_subtotal × discount_pct / 100)
grand_total       = subtotal + shipping_cost + tax_amount
```

---

## 7. Validation Rules

| Rule | Condition | Message |
|---|---|---|
| V-SP-01 | Any line item has no Item Price on submission | "All line items must have a price before submitting." |
| V-SP-02 | Delivery Date is before current date | "Delivery Date cannot be in the past." |
| V-SP-03 | Price Validity Date is before Due Date of RFQ | "Price Validity Date must be at or after the RFQ Due Date." |
| V-SP-04 | Discount % is outside 0–100 range | "Discount must be between 0% and 100%." |

---

## 8. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-SP-01 | Price waterfall recalculates within 100ms of any input change. | Performance |
| NFR-SP-02 | Supplier portal listing must load up to 200 RFQ rows without degradation. | Scalability |
| NFR-SP-03 | Quote Submission Side-Panel must be fully functional on standard tablet/desktop viewports. | UI/UX |

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Should a supplier be allowed to re-submit (update) a quote after initial submission, or is the first submission final? | Business | **Closed**: First submission is final for v0. |
| OQ-2 | Does the customer need any action on the "View Quotes" screen (e.g., "Accept Quote" / "Award to Supplier") in this version? | Product | **Closed**: No actions; read-only comparison for v0. |
| OQ-3 | How is the Tax Selection field populated — fixed list of tax types, or configurable? | Business | **Closed**: Fixed list of tax types. |

---

## 10. Future Scope

- **Quote Comparison Tool**: Side-by-side tabular comparison of all supplier quotes per line item, enabling the customer to see the best price/lead time per item at a glance.
- **Quote Acceptance & PO Generation**: Allow the customer to award a quote to a supplier directly from the View Quotes screen, triggering automatic Purchase Order creation.
- **Quote Re-submission / Updates**: Allow suppliers to revise and re-submit quotes after initial submission.
- **Re-quote / Negotiation Flow**: Enable the customer to send revision requests to a supplier, allowing the supplier to submit an updated quote within the same RFQ lifecycle.
- **Supplier Self-Registration**: Allow new suppliers to request access to the portal with an approval workflow for the procurement team.

---
*Document End.*
