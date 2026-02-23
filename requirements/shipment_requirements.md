# Product Requirements Document (PRD)
## Shipment Module - Enjen AI Logistics

**Version:** 1.0  
**Date:** 20 Feb 2026  
**Product:** AI-Powered ERP for Steel Manufacturers  

---

## 1. User Stories & Acceptance Criteria

### US-001: Select Invoices with Line Items
**As a** Dispatcher, **I want** to see invoice line items when selecting invoices **so that** I know exactly which steel coils/sheets are being shipped.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Each invoice card expands/collapses to show line items<br>2. Line items show: Product Name, Quantity, Weight per unit, Total Weight<br>3. Real-time counter shows: "X invoices, Y items, Z kg selected"<br>4. Counter updates immediately on select/unselect |
| **Priority** | P0 |

---

### US-002: Review Shipment with Full Details
**As a** Dispatcher, **I want** to review invoice items and delivery address before creating **so that** I can verify accuracy.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Review screen shows expandable invoice sections with line items<br>2. Delivery address (shipping address from invoice) displayed per invoice<br>3. Net Weight auto-calculated: Sum of (quantity × unit weight) for all selected items<br>4. Net Weight prominently displayed in summary section |
| **Priority** | P0 |

---

### US-003: Create Shipment and Auto-Generate Trip
**As a** Dispatcher, **I want** shipment creation to automatically create a trip **so that** drivers can execute delivery.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. On "Create Shipment" click: Shipment created (Status: Ready to Ship)<br>2. Trip automatically created with same ID/reference<br>3. Shipment List updates with new entry<br>4. Success modal shows with two CTAs: "View Shipment List" (secondary), "Go to Trips" (primary) |
| **Priority** | P0 |

---

### US-004: Shipment Status Lifecycle
**As an** Operations Manager, **I want** clear shipment states **so that** I can track progress accurately.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Draft: When "Save as Draft" clicked<br>2. Ready to Ship: When shipment created<br>3. In Transit: When trip started<br>4. Delivered: When trip completed<br>5. Cancelled: When manually cancelled (only from Ready to Ship or In Transit) |
| **Priority** | P0 |

---

### US-005: Cancel Shipment with Reason
**As a** Dispatcher, **I want** to cancel shipments with a reason **so that** operations have audit trail.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Cancel button available only in Ready to Ship and In Transit states<br>2. Modal requires reason text (min 10 chars)<br>3. On confirm: Status → Cancelled, invoices return to available pool<br>4. Toast notification: "Shipment cancelled. Invoices returned to pool." |
| **Priority** | P1 |

---

### US-006: Edit Shipment (Draft & Ready to Ship)
**As a** Dispatcher, **I want** to edit shipments before transit **so that** I can correct errors.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Edit button visible only in Draft and Ready to Ship states<br>2. Edit opens Create Shipment wizard pre-populated with current data<br>3. Can modify: Invoices, Transport mode, Vehicle/Driver, Dates<br>4. Save updates existing shipment (no new ID)<br>5. In Transit, Delivered, Cancelled: Edit button hidden |
| **Priority** | P1 |

---

### US-007: Add Gross Weight via Weighbridge
**As a** Warehouse Operator, **I want** to record weighbridge measurements **so that** actual shipping weight is documented.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. "Add Gross Weight" button visible only in Ready to Ship state<br>2. Click opens side panel with:<br>   - Truck Weight With Shipment (input, kg)<br>   - Truck Weight Without Shipment (input, kg)<br>   - Calculated Gross Weight (auto: With - Without)<br>3. Save displays both Net Weight and Gross Weight in panel<br>4. Data persists on Shipment Details screen |
| **Priority** | P1 |

---

## 2. Functional Requirements

### 2.1 Frontend Requirements

| ID | Requirement | Component |
|----|-------------|-----------|
| FR-FE-001 | Invoice selection screen displays expandable cards showing line items | Create Shipment Step 1 |
| FR-FE-002 | Real-time counter: "X invoices, Y items, Z kg" updates on every select/unselect | Create Shipment Step 1 |
| FR-FE-003 | Line item display: Product Name, Quantity, Unit Weight, Total Weight | Create Shipment Step 1 |
| FR-FE-004 | Review screen shows expandable invoice sections with line items | Create Shipment Step 3 |
| FR-FE-005 | Review screen displays Shipping Address per invoice | Create Shipment Step 3 |
| FR-FE-006 | Review screen displays auto-calculated Net Weight (sum of all item weights) | Create Shipment Step 3 |
| FR-FE-007 | Success modal has two CTAs: "View Shipment List" (outline), "Go to Trips" (filled) | Success Modal |
| FR-FE-008 | Shipment List updates immediately after creation (no refresh) | Shipment List |
| FR-FE-009 | Status badges: Draft (gray), Ready to Ship (blue), In Transit (purple), Delivered (green), Cancelled (red) | Shipment List, Details |
| FR-FE-010 | Cancel button visible only in Ready to Ship and In Transit states | Shipment Details |
| FR-FE-011 | Cancel modal requires reason text, min 10 characters, shows character count | Cancel Modal |
| FR-FE-012 | Edit button visible only in Draft and Ready to Ship states | Shipment Details |
| FR-FE-013 | Edit opens wizard pre-populated, maintains same Shipment ID | Create Shipment (Edit Mode) |
| FR-FE-014 | "Add Gross Weight" button visible only in Ready to Ship state | Shipment Details |
| FR-FE-015 | Gross Weight side panel: two inputs, auto-calculated result, save action | Gross Weight Panel |
| FR-FE-016 | Display Net Weight and Gross Weight together after entry | Shipment Details, Gross Weight Panel |
| FR-FE-017 | Disable/hide actions based on state (Edit, Cancel, Add Gross Weight) | Shipment Details |
| FR-FE-018 | Show toast: "Invoices returned to available pool" on cancel | Global Toast |
| FR-FE-019 | In Create Shipment transport details, only list available vehicles (not under maintenance/breakdown) and available drivers (not on leave) when user selects transport mode and assigns vehicle/driver | Create Shipment Step 2 |
| FR-FE-020 | Vehicle and driver dropdown/options are dynamically filtered based on up-to-date availability status | Create Shipment Step 2 |


### 2.2 Backend Requirements

| ID | Requirement | API/Service |
|----|-------------|-------------|
| FR-BE-001 | `GET /invoices/available` returns invoices with nested line items (product, qty, weight) | Invoice Service |
| FR-BE-002 | `POST /shipments` creates shipment, returns Shipment ID | Shipment Service |
| FR-BE-003 | On shipment create: Auto-create trip via `POST /trips` with shipment reference | Trip Service |
| FR-BE-004 | Transaction: Shipment + Trip creation atomic (both succeed or both fail) | Transaction Manager |
| FR-BE-005 | `GET /shipments` includes Net Weight (calculated), Gross Weight (null if not entered) | Shipment Service |
| FR-BE-006 | Net Weight calculation: Sum of (invoice_item.quantity × product.unit_weight) for all selected items | Calculation Engine |
| FR-BE-007 | `PATCH /shipments/:id` updates shipment, validates state allows editing | Shipment Service |
| FR-BE-008 | State machine enforcement: Draft→ReadyToShip→InTransit→Delivered, with Cancel from RTS/IT | State Manager |
| FR-BE-009 | `POST /shipments/:id/cancel` requires reason, updates status, releases invoices | Shipment Service |
| FR-BE-010 | On cancel: Update invoice statuses to "Available" via `PATCH /invoices/batch` | Invoice Service |
| FR-BE-011 | `POST /shipments/:id/gross-weight` accepts truck_with, truck_without, calculates gross | Shipment Service |
| FR-BE-012 | Gross Weight validation: gross = truck_with - truck_without, must be > 0 | Validation Service |
| FR-BE-013 | `GET /shipments/:id` returns full nested data: invoices→items→products, weights, trip reference | Shipment Service |
| FR-BE-014 | Shipment number generation: SH-YYYY-XXXX sequential | ID Service |
| FR-BE-015 | Duplicate prevention: Invoice can exist in only one non-cancelled, non-delivered shipment | Constraint Check |

---

## 3. State Machine Definition

```
[Draft] ──create()──► [Ready to Ship] ──trip.start()──► [In Transit] ──trip.complete()──► [Delivered]
    │                      │                              │
    │                      │                              │
    └─edit()───────────────┘                              │
                           │                              │
                           └────cancel(reason)─────────────┘
                                    │
                                    ▼
                              [Cancelled]
                              (invoices released)
```

**State Transition Rules:**

| From | To | Trigger | Allowed Roles |
|------|-----|---------|---------------|
| Draft | Ready to Ship | User clicks "Create Shipment" | Dispatcher |
| Draft | Draft | User clicks "Save as Draft" | Dispatcher |
| Ready to Ship | In Transit | Trip status changed to "Started" | System/Driver App |
| Ready to Ship | Cancelled | User cancels with reason | Dispatcher, Manager |
| In Transit | Delivered | Trip status changed to "Completed" | System/Driver App |
| In Transit | Cancelled | User cancels with reason | Manager only (with warning) |


---

## 5. UI Specifications

### 5.1 Create Shipment - Step 1 (Invoice Selection)

```
┌─────────────────────────────────────────┐
│ Create Shipment              [Draft]    │
│ ◉ 1 Select Invoices ─── 2 ─── 3         │
│                                         │
│ Priority: ○ High ● Normal ○ Low         │
│                                         │
│ [Search orders...            ]          │
│                                         │
│ ┌─ Invoice Card (Selected) ──────────┐  │
│ │ ☑ INV-2025-001                    │  │
│ │    JSW Steel Ltd | ₹55,000        │  │
│ │    ▼ Items (3)                    │  │
│ │      • Slit Coil 2mm - 5 qty -    │  │
│ │        5,000 kg                   │  │
│ │      • Cut Sheet 4ft - 10 qty -   │  │
│ │        2,500 kg                   │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ┌─ Invoice Card ─────────────────────┐  │
│ │ ☐ INV-2025-002                    │  │
│ │    Tata Steel | ₹45,000           │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ─────────────────────────────────────   │
│ 2 invoices, 5 items, 12,500 kg selected │
│ ─────────────────────────────────────   │
│                                         │
│ [Previous]  [Save as Draft]  [Next >]   │
└─────────────────────────────────────────┘
```

### 5.2 Create Shipment - Step 3 (Review)

```
┌─────────────────────────────────────────┐
│ Create Shipment                         │
│ ✓ 1 ─── ✓ 2 ─── ◉ 3 Review & Submit     │
│                                         │
│ ▼ Invoice Details (3 invoices)          │
│   ┌─────────────────────────────────┐   │
│   │ INV-2025-001 - JSW Steel Ltd    │   │
│   │ Ship to: Plot 45, MIDC Nagpur   │   │
│   │ ▼ Items (2)                     │   │
│   │   • Slit Coil 2mm - 5,000 kg    │   │
│   │   • Cut Sheet 4ft - 2,500 kg    │   │
│   └─────────────────────────────────┘   │
│                                         │
│ ▼ Transport Mode                        │
│   Internal Vehicle                      │
│   Vehicle: MH-17-AB-1234                │
│   Driver: Rajesh R                      │
│   E-way Bill: 1812 3456 7890            │
│   Pickup: 20-11-2025                    │
│                                         │
│ ─────────────────────────────────────   │
│ Total Net Weight: 12,500 kg             │
│ ─────────────────────────────────────   │
│                                         │
│ [Previous]  [Save as Draft]  [Create]   │
└─────────────────────────────────────────┘
```

### 5.3 Shipment Details - Ready to Ship State

```
┌─────────────────────────────────────────┐
│ Shipment Details                    [X] │
│                                         │
│ Order Details                           │
│ Shipment No: SH-2024-5704               │
│ Status: [Ready to Ship]                 │
│ Order No: ORD-2025-001                  │
│                                         │
│ ▼ Invoice Details                       │
│ ...                                     │
│                                         │
│ ▼ Transport Mode                        │
│ ...                                     │
│                                         │
│ ▼ Weights                               │
│ Net Weight: 12,500 kg                   │
│ [+ Add Gross Weight] ← Secondary CTA    │
│                                         │
│ Timeline                                │
│ ● Transit Entry Created                 │
│   20-11-2025 09:30 by John Doe          │
│ ○ Vehicle Dispatched                    │
│ ○ Location Update                       │
│                                         │
│ [Cancel Shipment]  [Edit]               │
│  (destructive)    (primary)             │
└─────────────────────────────────────────┘
```

### 5.4 Add Gross Weight Side Panel

```
┌────────────────────────┐
│ Add Gross Weight   [X] │
│                        │
│ Truck Weight With      │
│ Shipment (kg)          │
│ [25000       ]         │
│                        │
│ Truck Weight Without   │
│ Shipment (kg)          │
│ [9800        ]         │
│                        │
│ ─────────────────────  │
│ Gross Weight: 15,200 kg│
│ (Auto-calculated)      │
│ ─────────────────────  │
│                        │
│ Net Weight: 15,000 kg  │
│ (From invoice items)   │
│                        │
│        [Save]          │
└────────────────────────┘
```

---

## 7. Validation Matrix

| Field | Rule | Error Message |
|-------|------|---------------|
| Invoice selection | Min 1 selected | "Select at least one invoice" |
| E-way Bill | 12 digits, unique | "E-way Bill must be 12 digits" / "Already used in SH-XXXX" |
| Pickup Date | ≥today, ≤earliest delivery date | "Pickup date cannot be after delivery date [DATE]" |
| Cancel reason | Min 10 chars | "Reason must be at least 10 characters" |
| Truck weights | Both > 0, with > without | "Invalid weights" / "Gross weight must be positive" |
| Gross vs Net | Gross ≥ Net (warning if <) | "Warning: Gross weight less than net weight" |

---

## 8. Out of Scope (Explicit)

| Item | Reason |
|------|--------|
| Partial invoice selection (item-level) | Invoice-level granularity only |
| Editing in In Transit state | Operational lock after trip starts |
| Multiple trips per shipment | 1:1 Shipment:Trip mapping |
| Automatic gross weight from weighbridge | Manual entry only |
| Weight discrepancy alerts | Future enhancement |
| Split shipments | Not supported |
| Merge shipments | Not supported |

---