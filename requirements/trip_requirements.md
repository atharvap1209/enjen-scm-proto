# Product Requirements Document (PRD)
## Trip Module - Enjen AI Logistics

**Version:** 1.0  
**Date:** 20 Feb 2026  
**Product:** AI-Powered ERP for Steel Manufacturers  

---

## 1. User Stories & Acceptance Criteria

### US-TRIP-001: Automatic Trip Creation on Shipment
**As a** Dispatcher, **I want** trips to auto-create when I create a shipment with vehicle and driver **so that** I can track delivery execution.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Trip created automatically when Shipment created with Internal Vehicle mode<br>2. Trip initial status: "Scheduled"<br>3. Trip inherits: Vehicle, Driver, Invoice references from Shipment<br>4. Trip Number generated: TR-YYYY-XXX format<br>5. Trip linked to Shipment (1:1 relationship) |
| **Priority** | P0 |

---

### US-TRIP-002: View Trip List
**As a** Dispatcher, **I want** to see all trips with key details **so that** I can monitor delivery operations.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. List shows: Trip No., Vehicle, Driver, Customer, Status, Created Date<br>2. Status badges: Scheduled (gray), In Progress (blue), Completed (green), Cancelled (red)<br>3. Row click opens Trip Details side panel<br>4. Real-time search across Trip No., Vehicle, Driver, Customer<br> |
| **Priority** | P0 |

---

### US-TRIP-003: View Trip Details
**As a** Dispatcher, **I want** to see complete trip information at a glance **so that** I understand trip status in 3 seconds.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. Header: Trip Number, Shipment Number, Trip Status<br>2. Customer Name prominently displayed<br>3. Items being shipped with Invoice Numbers listed<br>4. Vehicle and Driver assigned shown<br>5. Trip Start Time displayed<br>6. Timeline showing: Transit Entry Created → Vehicle Dispatched → Location Updates<br>7. Action buttons contextually visible based on status |
| **Priority** | P0 |

---

### US-TRIP-004: Reassign Vehicle (Scheduled or In-Progress)
**As a** Dispatcher, **I want** to change the vehicle mid-trip **so that** I can handle breakdowns or capacity issues.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. "Reassign" button visible in Scheduled and In-Progress statuses<br>2. Click opens Reassign modal with two tabs/types: Vehicle or Driver<br>3. Select "Vehicle" type: shows Current Vehicle, select New Vehicle from available pool<br>4. Reason dropdown mandatory: Vehicle Breakdown, Accident, Maintenance Required, Capacity Issue, Other<br>5. Remarks field optional<br>6. Only "Available" vehicles shown in dropdown<br>7. On confirm: Trip updated, Shipment updated, old vehicle status updated per reason code |
| **Priority** | P1 |

---

### US-TRIP-005: Reassign Driver (Scheduled or In-Progress)
**As a** Dispatcher, **I want** to change the driver mid-trip **so that** I can handle emergencies or no-shows.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. In Reassign modal, select "Driver" type<br>2. Shows Current Driver, select New Driver from available pool<br>3. Reason dropdown mandatory: Health Issue, Personal Emergency, No Show, License Expired, Accident, Other<br>4. Handover Location field mandatory (text input)<br>5. Remarks field optional<br>6. Only "Available" drivers shown in dropdown<br>7. On confirm: Trip updated, Shipment updated, old driver status updated per reason code |
| **Priority** | P1 |

---

### US-TRIP-006: Mark Trip Complete
**As a** Driver/Operations, **I want** to mark trips as completed **so that** delivery is confirmed and shipment closes.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. "Mark Trip Completed" button visible only in In-Progress status<br>2. Click opens confirmation modal<br>3. Shows: Trip No., Completed Date and Time (auto-filled, editable)<br>4. Remarks field optional<br>5. On confirm: Trip status → Completed, Shipment status → Delivered<br>6. Success toast: "Trip completed successfully" |
| **Priority** | P0 |

---

### US-TRIP-007: View Linked Shipment
**As a** Dispatcher, **I want** to navigate to the linked shipment **so that** I can view full shipment details.

| Aspect | Details |
|--------|---------|
| **Acceptance Criteria** | 1. "View Linked Shipment" button in Trip Details<br>2. Click navigates to Shipment Details page<br>3. Back navigation returns to Trip List |
| **Priority** | P1 |

---

## 2. Functional Requirements

### 2.1 Frontend Requirements

| ID | Requirement | Component |
|----|-------------|-----------|
| FR-TRIP-FE-001 | Trip List displays columns: Trip No., Vehicle, Driver, Customer, Status, Created Date | Trip List |
| FR-TRIP-FE-002 | Status badges with colors: Scheduled(gray), In Progress(blue), Completed(green), Cancelled(red) | Trip List, Details |
| FR-TRIP-FE-003 | Search placeholder: "Search trips..." (not "Search drivers...") | Trip List |
| FR-TRIP-FE-004 | Trip Details side panel opens on row click | Trip List |
| FR-TRIP-FE-005 | Trip Details shows: Trip No., Shipment No., Status, Customer, Items+Invoices, Vehicle, Driver, Start Time, Timeline | Trip Details |
| FR-TRIP-FE-006 | Timeline shows: Transit Entry Created → Vehicle Dispatched → Location Updates (En Route) | Trip Details |
| FR-TRIP-FE-007 | "Reassign" button visible in Scheduled and In-Progress statuses only | Trip Details |
| FR-TRIP-FE-008 | "Mark Trip Completed" button visible only in In-Progress status | Trip Details |
| FR-TRIP-FE-009 | "View Linked Invoice" button always visible | Trip Details |
| FR-TRIP-FE-010 | Reassign modal has Type selector: Vehicle or Driver | Reassign Modal |
| FR-TRIP-FE-011 | Vehicle reassignment: Current Vehicle display, New Vehicle dropdown (available only), Reason dropdown, Remarks | Reassign Modal |
| FR-TRIP-FE-012 | Driver reassignment: Current Driver display, New Driver dropdown (available only), Reason dropdown, Handover Location, Remarks | Reassign Modal |
| FR-TRIP-FE-013 | Mark Complete modal: Trip No., Completed Date/Time (datetime picker), Remarks | Complete Modal |
| FR-TRIP-FE-014 | Success toast on reassignment: "Reassignment successful" | Global Toast |
| FR-TRIP-FE-015 | Real-time list update after reassignment/complete without refresh | Trip List |

### 2.2 Backend Requirements

| ID | Requirement | API/Service |
|----|-------------|-----------|
| FR-TRIP-BE-001 | `POST /trips` auto-created on `POST /shipments` (Internal mode only) | Trip Service |
| FR-TRIP-BE-002 | Trip number format: `TR-YYYY-XXXX` sequential | ID Service |
| FR-TRIP-BE-003 | `GET /trips` returns list with nested: vehicle, driver, customer (from shipment), status | Trip Service |
| FR-TRIP-BE-004 | `GET /trips/:id` returns full details with items, invoices, timeline events | Trip Service |
| FR-TRIP-BE-005 | `PATCH /trips/:id/reassign` handles vehicle or driver change | Trip Service |
| FR-TRIP-BE-006 | Reassignment transaction: Update trip, update shipment, update old vehicle/driver status | Transaction Manager |
| FR-TRIP-BE-007 | Vehicle status mapping: Breakdown/Accident→Breakdown, Maintenance→Maintenance, Capacity/Other→Available | Vehicle Service |
| FR-TRIP-BE-008 | Driver status mapping: Health/Personal/No Show/Accident→On Leave, License/Other→Available | Driver Service |
| FR-TRIP-BE-009 | `PATCH /trips/:id/complete` updates status, sets end time, triggers shipment delivery | Trip Service |
| FR-TRIP-BE-010 | Timeline events auto-created: Trip Created, Vehicle Dispatched (on status change), Location Updates | Timeline Service |
| FR-TRIP-BE-011 | Trip status change triggers Shipment status sync: Scheduled→Ready to Ship, In Progress→In Transit, Completed→Delivered | State Sync Service |

---

## 3. State Machine Definition

### Trip Status Transitions

```
[Scheduled] ──start()──► [In Progress] ──complete()──► [Completed]
      │                      │
      │                      │
      └────cancel()──────────┘
              │
              ▼
        [Cancelled]
```

### Shipment-Trip Status Sync

| Trip Status | Shipment Status | Trigger |
|-------------|-----------------|---------|
| Scheduled | Ready to Ship | Trip created |
| In Progress | In Transit | User/Driver starts trip |
| Completed | Delivered | User marks complete |
| Cancelled | Cancelled | Trip cancelled |

---

## 4. Data Model

### Trip Entity
```javascript
{
  id: "uuid",
  trip_number: "TR-2024-001",
  status: "SCHEDULED", // enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  
  // Relationships
  shipment_id: "uuid",
  shipment_number: "SH-2024-001",
  customer_id: "uuid",
  customer_name: "JSW Steel Ltd",
  
  // Vehicle Assignment
  vehicle_id: "uuid",
  vehicle_number: "MH-17-AB-1234",
  
  // Driver Assignment
  driver_id: "uuid",
  driver_name: "Rajesh R",
  
  // Timing
  scheduled_start_time: "2025-11-20T10:00:00Z",
  actual_start_time: null, // filled when status→IN_PROGRESS
  completed_at: null, // filled when status→COMPLETED
  
  // Items (from shipment invoices)
  items: [
    {
      invoice_id: "uuid",
      invoice_number: "INV-2025-001",
      product_name: "Slit Coil 2mm",
      quantity: 5,
      weight_kg: 5000
    }
  ],
  
  // Reassignment History
  reassignments: [
    {
      type: "VEHICLE", // or "DRIVER"
      old_id: "uuid",
      new_id: "uuid",
      reason: "Vehicle Breakdown",
      remarks: "Engine failure on highway",
      handover_location: null, // for driver only
      reassigned_at: "2025-11-20T12:00:00Z",
      reassigned_by: "user-uuid"
    }
  ],
  
  // Audit
  created_at: "2025-11-20T09:00:00Z",
  updated_at: "2025-11-20T09:00:00Z",
  created_by: "user-uuid"
}
```

---

## 5. Reassignment Reason Codes & Status Mapping

### Vehicle Reason Codes

| Reason Code | Old Vehicle Status | Description |
|-------------|-------------------|-------------|
| Vehicle Breakdown | Breakdown | Mechanical failure during trip |
| Accident | Breakdown | Vehicle involved in accident |
| Maintenance Required | Maintenance | Scheduled/unscheduled maintenance needed |
| Capacity Issue | Available | Vehicle capacity insufficient for load |
| Other | Available | Any other reason |

### Driver Reason Codes

| Reason Code | Old Driver Status | Description |
|-------------|------------------|-------------|
| Health Issue | On Leave | Driver medical emergency/illness |
| Personal Emergency | On Leave | Family/personal urgent matter |
| No Show | On Leave | Driver didn't report for duty |
| Accident | On Leave | Driver involved in accident |
| License Expired | Available | Driver license no longer valid |
| Other | Available | Any other reason |

---

## 6. UI Specifications

### 6.1 Trip List

```
┌─────────────────────────────────────────────────────────────┐
│ Trip                                           [Columns]
│ [Search trips...                              ]             
│                                                             
│ Trip No.    Vehicle        Driver       Customer      Status      Created
│ ─────────────────────────────────────────────────────────────────────────
│ TR-2024-001 MH-17-AB-1234  Rajesh R    JSW Steel Ltd [Scheduled] 20-11-2025
│ TR-2024-002 MH-17-CD-5678  Arjun Mehra Tata Steel    [In Progre] 20-11-2025
│ TR-2024-003 MH-17-EF-9012  Raghav Iyer Essar Steel   [Completed] 19-11-2025
│                                                             
│ Rows: [10 ▼]  Showing 1-10 of 15        [<] [1] [2] [>]        
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Trip Details - In Progress (with Reassign)

```
┌─────────────────────────────────────────┐
│ Trip Details                        [X] │
│                                         │
│ Trip No: TR-2024-001                    │
│ Shipment: SH-2024-001                   │
│ Status: [In Progress]                   │
│                                         │
│ Customer: JSW Steel Ltd                 │
│                                         │
│ Items Being Shipped:                    │
│ • Slit Coil 2mm (5 qty) - INV-2025-001  │
│ • Cut Sheet 4ft (10 qty) - INV-2025-002 │
│                                         │
│ Vehicle: MH-17-AB-1234                  │
│ Driver: Rajesh R                        │
│ Start Time: 20-11-2025 10:30            │
│                                         │
│ Timeline                                │
│ ● Transit Entry Created                 │
│   20-11-2025 09:30 by John Doe          │
│ ● Vehicle Dispatched                    │
│   20-11-2025 10:30 by System            │
│ ○ Location Update: En Route             │
│   20-11-2025 11:15 by System            │
│                                         │
│ [Reassign] [View Linked Shipment] [Mark Trip Completed] │
│  (secondary)  (secondary)         (primary)            │
└─────────────────────────────────────────┘
```

### 6.3 Trip Details - Completed

```
┌─────────────────────────────────────────┐
│ Trip Details                        [X] │
│                                         │
│ Trip No: TR-2024-001                    │
│ Shipment: SH-2024-001                   │
│ Status: [Completed]                     │
│                                         │
│ ... (same customer/items info) ...      │
│                                         │
│ Vehicle: MH-17-AB-1234                  │
│ Driver: Rajesh R                        │
│ Start: 20-11-2025 10:30                 │
│ End: 20-11-2025 18:30                   │
│                                         │
│ Timeline (all completed)                │
│                                         │
│ [View Linked Invoice]                   │
│  (primary)                              │
└─────────────────────────────────────────┘
```

### 6.4 Reassign Modal - Vehicle

```
┌────────────────────────┐
│ Reassign           [X] │
│                        │
│ Reassign Details       │
│ ▼                      │
│                        │
│ Current Driver: Rajesh R        Current Vehicle: MH-17-AB-1234
│                        │
│ Reassign Type *        Reason for Reassignment *
│ [Vehicle          ▼]   [Vehicle Breakdown  ▼]    
│                        │
│ New Vehicle *          Remarks
│ [MH-17-CD-5678   ▼]   [Enter notes...       ]
│                        │
│        [Cancel]  [Confirm Reassignment]      │
│                   (primary)                   │
└────────────────────────┘
```

### 6.5 Reassign Modal - Driver

```
┌────────────────────────┐
│ Reassign           [X] │
│                        │
│ Reassign Details       │
│ ▼                      │
│                        │
│ Current Driver: Rajesh R        Current Vehicle: MH-17-AB-1234
│                        │
│ Reassign Type *        Reason for Reassignment *
│ [Driver           ▼]   [Health Issue       ▼]    
│                        │
│ New Driver *           Handover Location *
│ [Arjun Mehra     ▼]   [Checkpoint 3 - Mumbai Toll Plaza]
│                        │
│ Remarks                │
│ [Enter notes...       ]│
│                        │
│        [Cancel]  [Confirm Reassignment]      │
│                   (primary)                   │
└────────────────────────┘
```

### 6.6 Mark Trip Complete Modal

```
┌────────────────────────┐
│ Mark Trip as Complete [X]│
│                        │
│ Trip Details           │
│ ▼                      │
│                        │
│ Trip No: TR-2024-001                    │
│ Completed Date and Time                 │
│ [20-11-2025 10:30    ]  [calendar][clock]│
│                        │
│ Remarks                │
│ [Enter notes...                          ]│
│                        │
│        [Cancel]  [Confirm Completion]      │
│                   (primary)                 │
└────────────────────────┘
```

---

## 7. Validation Matrix

| Field | Rule | Error Message |
|-------|------|---------------|
| Reassign Type | Required | "Select reassignment type" |
| New Vehicle | Required if type=VEHICLE, must be Available | "Select an available vehicle" |
| New Driver | Required if type=DRIVER, must be Available | "Select an available driver" |
| Reason | Required | "Select a reason" |
| Handover Location | Required if type=DRIVER | "Enter handover location" |
| Completed Date/Time | Required, ≥start time, ≤now | "Invalid completion time" |

---

## 8. Out of Scope (Explicit)

| Item | Reason |
|------|--------|
| External Carrier trips | No trip created for external shipments |
| Trip creation UI | Auto-created only, no manual creation |
| GPS real-time tracking | "Current location" static for now |
| Route optimization | Future AI feature |
| Multiple shipments per trip | 1:1 Shipment:Trip only |
| Trip editing (dates, items) | Reassign only, no other edits |
| Trip cancellation UI | Handled via Shipment cancellation |
| Driver mobile app | Web-only for dispatchers |

---

## 9. Integration with Shipment Module

| Event | Shipment Action | Trip Action |
|-------|----------------|-------------|
| Shipment Created (Internal) | Status: Ready to Ship | Auto-create, Status: Scheduled |
| Shipment Cancelled | Status: Cancelled | Status: Cancelled (cascade) |
| Trip Started | Status: In Transit | Status: In Progress |
| Trip Completed | Status: Delivered | Status: Completed |
| Trip Reassigned (Vehicle/Driver) | Update Vehicle/Driver | Update Vehicle/Driver, Log history |

---
