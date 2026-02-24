# Product Requirements Document
# Work Order Module — Steel Coil Processing ERP

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
   - [US-WO-01: Create Work Order — Finished Good Specifications](#us-wo-01-create-work-order--finished-good-specifications)
   - [US-WO-02: Coil Selection & Wastage Preview](#us-wo-02-coil-selection--wastage-preview)
   - [US-WO-03: Output Planning — Cutting Operation](#us-wo-03-output-planning--cutting-operation)
   - [US-WO-04: Output Planning — Slitting Operation](#us-wo-04-output-planning--slitting-operation)
   - [US-WO-05: Output Planning — Slitting + Cutting Operation](#us-wo-05-output-planning--slitting--cutting-operation)
   - [US-WO-06: Line & Machine Assignment](#us-wo-06-line--machine-assignment)
   - [US-WO-07: Review & Submit Work Order](#us-wo-07-review--submit-work-order)
   - [US-WO-08: Release Work Order](#us-wo-08-release-work-order)
   - [US-WO-09: Work Order Lifecycle Management (Hold / Resume / Abort)](#us-wo-09-work-order-lifecycle-management-hold--resume--abort)
   - [US-WO-10: Work Order Listing & Dashboard](#us-wo-10-work-order-listing--dashboard)
   - [US-WO-11: Save Work Order as Draft](#us-wo-11-save-work-order-as-draft)
   - [US-WO-12: Discard a Submitted Work Order](#us-wo-12-discard-a-submitted-work-order)
5. [Functional Requirements Summary](#5-functional-requirements-summary)
6. [Calculation Specifications](#6-calculation-specifications)
7. [Validation Rules](#7-validation-rules)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data Model Notes](#9-data-model-notes)
10. [Open Questions](#10-open-questions)
11. [Out of Scope](#11-out-of-scope)

---

## 1. Overview & Purpose

The Work Order (WO) Module is the core planning engine within the Steel Coil Processing ERP. It enables Production Managers to:

- Specify what finished goods need to be produced (grade, thickness, width, coating, quantity).
- Select which input coils from inventory will be consumed.
- Plan the operational output in detail (slitting widths, cut lengths, number of pieces/packets).
- Assign the work to a specific production line and machine.
- Control the lifecycle of the work order from creation through completion or discard.

The Work Order is the primary planning artefact that drives downstream modules, including the **Production Process Module** (stage tracking and actuals capture).

---

## 2. Personas & Actors

| Persona | Role | Key Goals |
|---|---|---|
| **Production Manager** | Primary creator and supervisor of work orders | Create accurate WOs, minimise coil wastage, hit due dates |
| **Shift Supervisor** | Manages day-to-day execution | Start, hold, resume, complete stages |
| **QC Inspector** | Quality gating per stage (if enabled) | Pass/fail quality checks before stage completion |
| **Plant Manager** | Monitoring and oversight | View WO status, utilisation %, and coil wastage |
| **System / ERP** | Automated actions on WO state changes | Create production process tasks, update inventory |

---

## 3. Module Architecture Summary

```
Work Order Creation (5-Step Wizard)
 ├── Step 1: Work Order Header (Date, Customer)
 ├── Step 2: Finished Good Specifications
 ├── Step 3: Operation Selection
 ├── Step 4: Coil Selection & Output Planning
 │    ├── Cutting Output Planning (if operation = Cutting or Slitting+Cutting)
 │    └── Slitting Output Planning (if operation = Slitting or Slitting+Cutting)
 ├── Step 5: Line & Machine Assignment
 └── Step 6: Review & Submit

Work Order Lifecycle
 Draft → Pending → In Progress → [On Hold] → Completed
                 ↘ Discarded
                              ↘ Aborted (from In Progress or On Hold)
```

> **Note:** The step numbered "Step 3" in the creation flow is Operation Selection. Output Planning in Step 4 dynamically adapts based on the operation chosen in Step 3.

---

## 4. User Stories & Requirements

---

### US-WO-01: Create Work Order — Finished Good Specifications

**As a** Production Manager,  
**I want to** specify the header details and finished good specifications at the start of creating a Work Order,  
**So that** the ERP knows what product is expected at the end of the production run, and can filter the appropriate input coils.

#### 4.1.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-001 | The creation flow shall be a multi-step wizard with a persistent progress indicator. | Must Have |
| WO-REQ-002 | Step 1 — **Work Order Header**: Capture Work Order Due Date, Priority (High, Medium, Low via radio buttons), and Customer(s) (multi-select allowed). | Must Have |
| WO-REQ-003 | Step 2 — **Finished Good Specifications**: Capture Category, Grade, Thickness (range: min–max mm), Width (range: min–max mm), Coating, Surface Finish, Item Type, and Quantity Demanded (MT). | Must Have |
| WO-REQ-004 | Step 3 — **Operation Sequence**: Allow selection of exactly one of: `Cutting`, `Slitting`, `Slitting + Cutting`. No other combinations shall be permitted. | Must Have |
| WO-REQ-005 | All required fields shall be validated before allowing progression to the next step. Inline error messages shall appear below the offending field. | Must Have |
| WO-REQ-006 | The user shall be able to navigate back to a previous step without losing entered data. | Must Have |
| WO-REQ-007 | A Work Order Number shall be auto-generated on first save (Draft state). | Must Have |
| WO-REQ-008 | The wizard shall support a "Save as Draft" action at any step. | Must Have |

#### 4.1.2 Acceptance Criteria

- [ ] All three sections (Header, Specifications, Operations) are visible as distinct steps in the wizard.
- [ ] Attempting to proceed without filling all required fields shows field-level validation errors.
- [ ] Only `Cutting`, `Slitting`, or `Slitting + Cutting` can be selected for Operation Sequence; any other value is rejected.
- [ ] Navigating backwards pre-populates all previously entered data.
- [ ] Saving as Draft at Step 1 generates a WO number and stores the record with status = `Draft`.
- [ ] Customer field supports multi-select with comma-separated display in list views.

---

### US-WO-02: Coil Selection & Wastage Preview

**As a** Production Manager,  
**I want to** see a list of coils that match the finished good specifications I entered, select one or more of them, and immediately see the impact on wastage and quantity coverage,  
**So that** I can make an informed coil allocation decision before planning outputs.

#### 4.2.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-009 | The system shall filter coils from inventory based on the specifications entered in Step 2 (Category, Grade, Thickness range, Width range, Coating, Surface Finish). | Must Have |
| WO-REQ-010 | The coil list shall display columns: Coil No., Category, Grade, Thickness (mm), Width (mm), Surface, Current Weight (MT), Aging (days since receipt). | Must Have |
| WO-REQ-011 | The user shall be able to select one or more coils using checkboxes. | Must Have |
| WO-REQ-012 | A **Leftover Coil Summary** panel shall update in real time when coil selections change, showing: Total Allocated Weight (MT), Quantity Demanded (MT), Expected Residual (MT) after processing, and Leftover Coil %. | Must Have |
| WO-REQ-013 | Expected Residual calculation: `expected_residual = total_allocated - quantity_demand - estimated_wastage_total` | Must Have |
| WO-REQ-014 | At least one coil must be selected to proceed to the Output Planning step. | Must Have |
| WO-REQ-015 | Selected coils shall be carried forward as the source for Output Planning (dropdown of selected coils). | Must Have |
| WO-REQ-016 | Coil list shall support sorting by any column header. | Should Have |
| WO-REQ-017 | Coil list shall support filtering/search within the list. | Should Have |

#### 4.2.2 Acceptance Criteria

- [ ] Only coils matching all specification filters appear in the list.
- [ ] Selecting a coil immediately updates the Leftover Coil Summary panel.
- [ ] Leftover Coil % is computed accurately using the formula in WO-REQ-013.
- [ ] The "Next" button is disabled until at least one coil is selected.
- [ ] All selected coils are available in the coil dropdown in Output Planning.
- [ ] Deselecting a coil removes it from the Output Planning coil dropdown and recalculates outputs.

---

### US-WO-03: Output Planning — Cutting Operation

**As a** Production Manager,  
**I want to** plan the cutting outputs for a Cutting-only work order by specifying the part name, target length, and number of pieces per coil,  
**So that** the system can calculate the coil utilisation, weight of each part, and flag if the total length demanded exceeds what the coil can provide.

#### 4.3.1 Background

Cutting = slicing a coil axially into **sheets** of the same width as the coil, differentiated only by length. Width is fixed (equals the selected coil width). Length is the variable.

**Coil Length Derivation:**

```
total_length_meters = (weight_kg × 1000) / (thickness_mm × width_mm × STEEL_DENSITY)
STEEL_DENSITY = 7.85
```

If a user-entered coil length exists (e.g., from transit/receiving), it shall always take precedence over the calculated value.

#### 4.3.2 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-018 | The Output Planning screen for Cutting shall show a **Parent Coil Details** header: Coil No. (dropdown of selected coils), Thickness (read-only), Width (read-only), Available Weight (read-only), Total Length in meters (auto-calculated). | Must Have |
| WO-REQ-019 | Total Length shall be calculated using the formula: `total_length = (weight_kg × 1000) / (thickness_mm × width_mm × 7.85)`. If user-entered coil length exists, use that instead. | Must Have |
| WO-REQ-020 | Each output row shall accept: Part Name, Target Length (mm), Number of Pieces. | Must Have |
| WO-REQ-021 | The system shall auto-calculate and display (read-only): Weight of Part (MT) and Leftover % for that coil. | Must Have |
| WO-REQ-022 | Weight per output: `weight_MT = ((thickness_mm × width_mm × length_mm) / 1_000_000 × 7.85 × num_pieces) / 1000` | Must Have |
| WO-REQ-023 | The total length of all outputs for a given coil must not exceed the coil's total available length. Show an inline error if exceeded. | Must Have |
| WO-REQ-024 | A **Per-Coil Summary** row shall show: Total Pieces, Total Length Required (mm), Head/Tail Scrap (mm), Wastage % and Utilization % — updated in real time on each output addition or edit. | Must Have |
| WO-REQ-025 | Head/Tail Scrap: `scrap_mm = available_length_mm - total_length_required_mm`. Negative scrap triggers an error. | Must Have |
| WO-REQ-026 | An **Overall Summary** at the bottom shall show: Total Expected Weight (MT), Total Input Weight (MT), Expected Residual (BCR) (MT), Combined Wastage %, Overall Utilization %. | Must Have |
| WO-REQ-027 | The user can add multiple output rows per coil and also switch to a different parent coil via the dropdown to plan outputs for that coil. | Must Have |
| WO-REQ-028 | Sheets per Packet and Number of Packets inputs shall be available to group pieces into packets. Packet Weight (MT) shall be auto-calculated. | Should Have |

#### 4.3.3 Acceptance Criteria

- [ ] Selecting a different coil from the dropdown instantly populates thickness, width, weight, and length.
- [ ] Adding an output row auto-calculates Weight and Leftover % without user action.
- [ ] Total Length Required shown in summary equals sum of (Target Length × Pieces) across all rows.
- [ ] Entering outputs whose combined length > coil length disables the "Next" button and shows an error.
- [ ] All summary figures recalculate immediately on any field change.
- [ ] Packet Weight = `round(((thickness × width × length) / 1_000_000 × 7.85 × sheets_per_packet) / 1000, 2)`

---

### US-WO-04: Output Planning — Slitting Operation

**As a** Production Manager,  
**I want to** plan slit outputs by specifying each slit's target width, number of slits, and parts per coil,  
**So that** the system can calculate coil utilisation, weight of each output coil, and flag any overrun of the parent coil width.

#### 4.4.1 Background

Slitting = cutting a coil longitudinally into **narrower coils** of varying widths. The sum of (target_width × no_of_slits) for all planned outputs must not exceed the parent coil width.

#### 4.4.2 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-029 | The Output Planning screen for Slitting shall show a **Parent Coil Details** header: Coil No. (dropdown), Thickness (read-only), Width (read-only), Available Weight (read-only), Total Length meters (auto-calculated). | Must Have |
| WO-REQ-030 | Each output (Material) row shall accept: Part Name, Parent Coil (dropdown), Customer Name, Target Width (mm), No. of Slits, Parts per Coil (default = 1). | Must Have |
| WO-REQ-031 | System shall auto-calculate for each output: No. of Output Coils, Weight per Output Coil (MT), Meters per Output Coil, Total Quantity (MT), Total Meters, Percentage of parent coil allocated. | Must Have |
| WO-REQ-032 | Formulas: <br> `no_of_output_coils = slits × parts_per_coil (or slits if parts_per_coil = 0)` <br> `weight_per_coil_MT = ((thickness × width × total_length × 7.85) / 1000) / parts_per_coil / 1000` <br> `meters_per_coil = total_length / (slits × parts_per_coil)` <br> `total_qty_MT = weight_per_coil_MT × no_of_output_coils` <br> `total_meters = meters_per_coil × no_of_output_coils` <br> `percentage = (total_qty_MT / parent_available_MT) × 100` | Must Have |
| WO-REQ-033 | Sum of `(target_width × no_of_slits)` for all outputs must not exceed the parent coil width. Show an inline error and disable progression if exceeded. | Must Have |
| WO-REQ-034 | A **Per-Coil Summary** section shall show: Total Output Width (mm), Wastage Width (mm), Wastage %, Utilization % — updated in real time. | Must Have |
| WO-REQ-035 | Wastage Width = `parent_width - total_output_width`. Wastage % = `(wastage_width / parent_width) × 100`. Utilization % = `100 - wastage_%`. | Must Have |
| WO-REQ-036 | An **Overall Summary** shall show: Total Expected Weight (MT), Wastage Weight (MT), Combined Wastage %, Overall Utilization %. | Must Have |
| WO-REQ-037 | Multiple outputs (materials) can be added per coil. | Must Have |

#### 4.4.3 Acceptance Criteria

- [ ] Parts per Coil defaults to 1; entering 0 treats it as 1 with no division error.
- [ ] Total Output Width in summary = sum of (width × slits) for all outputs.
- [ ] Adding an output that causes Total Output Width > Parent Width shows an error and prevents saving.
- [ ] All calculated fields (Weight, Meters, %) are read-only and update on every field change.
- [ ] Wastage Width, Wastage % and Utilization % are accurate per the formulae in WO-REQ-035.
- [ ] Combined Wastage % = `(wastage_weight / parent_coil_available) × 100` — not derived naively from the UI.

---

### US-WO-05: Output Planning — Slitting + Cutting Operation

**As a** Production Manager,  
**I want to** plan combined slitting and cutting outputs in two sequential sub-steps — first defining the slitting outputs and then specifying the cutting outputs for each slit,  
**So that** I have full traceability and control over which slit coil is being used for each set of sheets.

#### 4.5.1 Background

Slitting + Cutting = the coil is first slit into narrower coils and those are then cut into sheets. This is handled as a **two-part sequential wizard step**:
1.  **Sub-step 3A (Slitting):** Identical to the Slitting-only planning flow. User defines the longitudinal slits.
2.  **Sub-step 3B (Cutting):** User defines the cut sheets. A "From Slit" dropdown identifies which of the slits defined in 3A is the source for that specific cutting output.

Navigation between these sub-steps is strictly handled by the main **Next** and **Previous** footer buttons.

#### 4.5.2 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-038 | The Slitting + Cutting flow shall be split into two sub-steps (3A: Slitting, 3B: Cutting). | Must Have |
| WO-REQ-039 | Sub-step 3A (Slitting) shall allow adding slitting outputs (Part Name, Width, No. of Slits) identical to the Slitting-only flow. | Must Have |
| WO-REQ-040 | Clicking "Next" on Sub-step 3A shall transition the user to Sub-step 3B (Cutting) ONLY if at least one slitting output is defined. | Must Have |
| WO-REQ-041 | Sub-step 3B (Cutting) shall display a **Slitting Outputs Reference** panel showing all slits planned in 3A. | Must Have |
| WO-REQ-042 | Sub-step 3B (Cutting) output rows shall accept: From Slit (dropdown of Part Names from 3A), Part Name, Target Length, and Number of Pieces. | Must Have |
| WO-REQ-043 | Clicking "Previous" on Sub-step 3B shall return the user to Sub-step 3A. | Must Have |
| WO-REQ-044 | System shall auto-calculate: Weight (MT), Leftover % for all outputs in both sub-steps. | Must Have |
| WO-REQ-045 | Combined validation: Total slit width must not exceed parent width, and total length of cuts per slit must not exceed parent coil length. | Must Have |

#### 4.5.3 Acceptance Criteria

- [ ] Transition between Slitting (3A) and Cutting (3B) is handled by the main Next/Previous wizard buttons.
- [ ] User cannot proceed to Cutting until at least one slitting output is added.
- [ ] In the Cutting step, the "From Slit" dropdown contains only the slits defined in the previous sub-step.
- [ ] Changing a slit's width in 3A correctly reflects in the 3B reference panel and output rows.
- [ ] Final Review step displays both Slitting and Cutting tables in separate sections.

---

### US-WO-06: Line & Machine Assignment

**As a** Production Manager,  
**I want to** assign a production line and machine to each operation in the Work Order,  
**So that** the production team knows which physical equipment to use.

#### 4.6.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-046 | For each operation defined in the WO (Slitting and/or Cutting), the user shall select a Line and a Machine from separate dropdowns. | Must Have |
| WO-REQ-047 | Line and Machine dropdowns shall be populated from the master data configuration. | Must Have |
| WO-REQ-048 | Each operation must have both Line and Machine assigned before the review step can be reached. | Must Have |
| WO-REQ-049 | If the WO has both Slitting and Cutting operations (Slitting + Cutting), both operations require their own independent Line and Machine entries. | Must Have |

#### 4.6.2 Acceptance Criteria

- [ ] Separate Line + Machine rows appear for each operation type.
- [ ] Attempting to proceed without assigning Line and Machine shows validation errors.
- [ ] Values persist when navigating back and forth.

---

### US-WO-07: Review & Submit Work Order

**As a** Production Manager,  
**I want to** review a complete summary of the Work Order before submitting it,  
**So that** I can catch errors before it becomes active.

#### 4.7.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-050 | The Review screen shall display a read-only summary: WO Header (Customer, Due Date), Finished Good Specifications, Operation Sequence, Selected Coil(s) with Leftover %, Outputs table(s) (one per operation), Line & Machine Assignment, Audit Trail. | Must Have |
| WO-REQ-051 | Three actions shall be available on the Review step: **Submit**, **Save as Draft**, **Go to Previous Step**. | Must Have |
| WO-REQ-052 | On **Submit**, the WO status changes from `Draft` to `Pending`. | Must Have |
| WO-REQ-053 | On Submit success, a success state is shown with two CTAs: Primary — **Release WO**, Secondary — **View WO List**. | Must Have |
| WO-REQ-054 | The Audit Trail shall log: who created the WO and when, when it was submitted, and all subsequent status changes with timestamp and user. | Must Have |

#### 4.7.2 Acceptance Criteria

- [ ] All section data on the Review screen matches what was entered in prior steps.
- [ ] Submit is not available if any mandatory field is missing (should have been caught per-step, but final guard exists).
- [ ] After Submit, WO status = `Pending` in the database.
- [ ] Success screen shows two CTAs and navigates correctly on each click.
- [ ] Audit Trail shows the creation and submission events with correct timestamps and user names.

---

### US-WO-08: Release Work Order

**As a** Production Manager,  
**I want to** explicitly release a submitted (Pending) Work Order to begin production,  
**So that** the Production Process tasks are activated and the shop floor knows to start.

#### 4.8.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-055 | From the WO Detail view (status = Pending), a **Release Work Order** primary CTA shall be shown. | Must Have |
| WO-REQ-056 | On Release: WO status changes to `In Progress`, and the first Production Process stage moves to `In Progress`. | Must Have |
| WO-REQ-057 | Release triggers creation / activation of Production Process tasks for each operation in the WO if they were not already created at submit time. | Must Have |
| WO-REQ-058 | A red-stroke secondary **Discard** CTA shall be available when WO status = `Pending`. | Must Have |

#### 4.8.2 Acceptance Criteria

- [ ] Clicking Release changes WO status from `Pending` to `In Progress`.
- [ ] After Release, the corresponding Production Process stage is visible with status `Not Started` and a `Start Stage` CTA.
- [ ] Release is not available when WO status is anything other than `Pending`.
- [ ] Discard on a Pending WO changes status to `Discarded` and deletes associated Production Process tasks.

---

### US-WO-09: Work Order Lifecycle Management (Hold / Resume / Abort)

**As a** Production Manager or Shift Supervisor,  
**I want to** put a Work Order on hold, resume it, or abort it during production,  
**So that** production can be paused safely and operations have visibility into why WOs are interrupted.

#### 4.9.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-059 | When WO status = `In Progress`: Show **Hold** and **Abort** CTAs. | Must Have |
| WO-REQ-060 | **Hold**: Changes WO status to `On Hold`. The stage currently `In Progress` also moves to `On Hold`. | Must Have |
| WO-REQ-061 | When WO status = `On Hold`: Show **Resume** CTA only. | Must Have |
| WO-REQ-062 | **Resume**: Changes WO status back to `In Progress`. The stage on hold resumes to `In Progress`. | Must Have |
| WO-REQ-063 | **Abort**: Opens a side panel asking the user to provide a mandatory Reason for Aborting. On confirmation, WO status = `Aborted` and all associated stages are aborted. | Must Have |
| WO-REQ-064 | Aborted WOs are visible in the listing with status `Aborted` but no further action CTAs. | Must Have |
| WO-REQ-065 | Completed and Discarded WOs shall have no action CTAs. | Must Have |

#### 4.9.2 WO Lifecycle State Machine

| Current Status | Allowed Actions |
|---|---|
| Draft | Save as Draft, Submit |
| Pending | Release WO, Discard |
| In Progress | Hold, Abort |
| On Hold | Resume, |
| Completed | (none) |
| Discarded | (none) |
| Aborted | (none) |

#### 4.9.3 Acceptance Criteria

- [ ] Hold on an In-Progress WO moves both WO and active stage to `On Hold`.
- [ ] Resume on an On-Hold WO moves both WO and the held stage back to `In Progress`.
- [ ] Abort opens a side panel; the reason field is mandatory; clicking Confirm without a reason is blocked.
- [ ] After Abort, WO and all stages show `Aborted` status with the abort reason visible in the Audit Trail.
- [ ] No CTA appears on Completed, Discarded, or Aborted WOs.

---

### US-WO-10: Work Order Listing & Dashboard

**As a** Production Manager or Plant Manager,  
**I want to** see all Work Orders in a list view with key status and efficiency metrics,  
**So that** I can quickly identify bottlenecks, overdue orders, or orders with high wastage.

#### 4.10.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-066 | The WO Listing shall display columns: WO Number, Status, Priority, Customer Name (comma-separated if multiple), Coil Utilization %, Leftover %, Start Date, Due Date. | Must Have |
| WO-REQ-067 | The listing shall support filtering by Status, Customer, Due Date range, and Priority. | Must Have |
| WO-REQ-068 | The listing shall support sorting by any column. | Must Have |
| WO-REQ-069 | Clicking a WO row shall navigate to the WO Detail view. | Must Have |
| WO-REQ-070 | WO status shall be colour-coded: Draft (grey), Pending (yellow), In Progress (blue), On Hold (orange), Completed (green), Discarded/Aborted (red). | Should Have |
| WO-REQ-071 | A search bar shall allow searching by WO Number or Customer Name. | Should Have |
| WO-REQ-072 | Pagination or infinite scroll shall be implemented for long lists. | Must Have |

#### 4.10.2 Acceptance Criteria

- [ ] All defined columns appear in the correct order.
- [ ] Filters work independently and in combination.
- [ ] Status badges display with the correct colour per WO-REQ-070.
- [ ] Clicking any row navigates to its Detail view without error.

---

### US-WO-11: Save Work Order as Draft

**As a** Production Manager,  
**I want to** save my in-progress Work Order as a draft at any point in the wizard,  
**So that** I can return to complete it later without losing my work.

#### 4.11.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-073 | "Save as Draft" shall be available at every wizard step. | Must Have |
| WO-REQ-074 | Draft WOs shall appear in the WO Listing with status `Draft`. | Must Have |
| WO-REQ-075 | Clicking a Draft WO from the listing shall re-open the wizard at the last completed step. | Must Have |
| WO-REQ-076 | Draft WOs shall not generate Production Process tasks. | Must Have |

#### 4.11.2 Acceptance Criteria

- [ ] Saving a draft at Step 3 and re-opening restores Steps 1, 2, and 3 data correctly.
- [ ] No Production Process tasks exist for any Draft WO.
- [ ] Draft WOs are excluded from production metrics/dashboards.

---

### US-WO-12: Discard a Submitted Work Order

**As a** Production Manager,  
**I want to** discard a Work Order that has been submitted but not yet released,  
**So that** I can cancel orders that are no longer needed before they hit the shop floor.

#### 4.12.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-077 | Discard is available only when WO status = `Pending`. | Must Have |
| WO-REQ-078 | On Discard, WO status changes to `Discarded`. | Must Have |
| WO-REQ-079 | On Discard, any Production Process tasks associated with the WO shall be deleted. | Must Have |
| WO-REQ-080 | A confirmation dialog shall appear before Discard is committed. | Must Have |

#### 4.12.2 Acceptance Criteria

- [ ] Clicking Discard without confirming the dialog does nothing.
- [ ] After confirmation, WO status = `Discarded`.
- [ ] No Production Process tasks remain linked to the Discarded WO.

---

### US-WO-13: Coil Substitution on Released Work Order

**As a** Production Manager or Shift Supervisor,  
**I want to** swap an allocated coil with a different one even after the Work Order is released,  
**So that** production can continue if the original coil is physically unavailable or found to be defective before processing starts.

#### 4.13.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| WO-REQ-081 | A **"Swap Coil"** CTA shall be available on the Work Order Detail view when status = `In Progress`. | Must Have |
| WO-REQ-082 | The "Swap Coil" action shall only be permitted if the first production stage is either `Not Started` or `In Progress` but has **zero recorded actuals**. | Must Have |
| WO-REQ-083 | Clicking "Swap Coil" shall open a side panel allowing the user to select a replacement coil from the filtered inventory. | Must Have |
| WO-REQ-084 | The substitution panel shall display a **Preview** showing: Original Coil vs. New Coil dimensions, weight, and the updated **Planned Output & Wastage** calculation (referencing US-WO-02 logic). | Must Have |
| WO-REQ-085 | Upon confirmation: the original coil is released back to available inventory; the new coil is allocated; and the Production Process tasks are automatically updated with the new coil specifications. | Must Have |
| WO-REQ-086 | The coil swap event must be logged in the Work Order audit trail with: "Coil [ID1] swapped with [ID2]". | Must Have |

#### 4.13.2 Acceptance Criteria

- [ ] "Swap Coil" CTA is visible on a released WO.
- [ ] If any actuals have been entered in the first stage, "Swap Coil" is disabled with a tooltip explaining why.
- [ ] Selecting a new coil shows the recalculated wastage and output preview immediately.
- [ ] Confirming the swap updates the linked Production Process tasks without requiring a full WO reset.
- [ ] Inventory records reflect the release of the old coil and allocation of the new one.

---

## 5. Functional Requirements Summary

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-WO-01 | Multi-step WO creation wizard with progress indicator and back navigation. | Must Have |
| FR-WO-02 | Coil filtering based on finished good specifications from inventory master. | Must Have |
| FR-WO-03 | Real-time coil length calculation from weight, thickness, and width using steel density constant (7.85). | Must Have |
| FR-WO-04 | Dynamic output planning UI adapting to Cutting, Slitting, or Slitting+Cutting operation. | Must Have |
| FR-WO-05 | Auto-calculation of all weight, wastage, and utilisation fields — no manual entry of derived values. | Must Have |
| FR-WO-06 | Validation preventing total output widths (Slitting) or total output lengths (Cutting) from exceeding coil capacity. | Must Have |
| FR-WO-07 | Auto-derivation of slitting and cutting sub-tables from combined output rows in Slitting+Cutting mode. | Must Have |
| FR-WO-08 | Line and machine assignment per operation from a master data dropdown. | Must Have |
| FR-WO-09 | Read-only Review screen with audit trail. | Must Have |
| FR-WO-10 | Full WO lifecycle state machine with correct CTA availability per status. | Must Have |
| FR-WO-11 | Auto-generation of Production Process tasks on WO Submit (or Release). | Must Have |
| FR-WO-12 | Deletion of Production Process tasks on WO Discard. | Must Have |
| FR-WO-13 | WO listing with filtering, sorting, search, and colour-coded status. | Must Have |
| FR-WO-14 | Abort reason capture via side panel with mandatory field. | Must Have |
| FR-WO-15 | Audit trail logging all state changes with user and timestamp. | Must Have |

---

## 6. Calculation Specifications

### 6.1 Universal Constants

```javascript
const STEEL_DENSITY = 7.85; // g/cm³
```

### 6.2 Coil Length from Weight

```javascript
total_length_meters = (weight_kg × 1000) / (thickness_mm × width_mm × 7.85)
// Precedence: Use user-entered coil length if available; otherwise calculate from weight.
```

### 6.3 Slitting Calculations (per output row)

```javascript
// No. of output coils
no_of_output_coils = (parts_per_coil === 0) ? no_of_slits : no_of_slits × parts_per_coil

// Weight per output coil
weight_per_coil_kg = ((thickness_mm × target_width_mm × total_length_meters × 7.85) / 1000) 
                      / (parts_per_coil || 1)
weight_per_coil_MT = weight_per_coil_kg / 1000

// Meters per output coil
meters_per_coil = total_length_meters / (no_of_slits × (parts_per_coil || 1))

// Total quantity
total_qty_MT = weight_per_coil_MT × no_of_output_coils

// Total meters
total_meters = meters_per_coil × no_of_output_coils

// Percentage of parent coil
percentage = (total_qty_MT / parent_available_MT) × 100

// Per-coil summary
total_output_width = Σ (target_width × no_of_slits)
wastage_width_mm   = parent_coil_width - total_output_width
wastage_pct        = (wastage_width_mm / parent_coil_width) × 100
utilization_pct    = 100 - wastage_pct

// Overall summary
wastage_weight_MT  = (thickness_mm × wastage_width_mm × total_length_meters × 7.85) / 1_000_000
combined_wastage_pct = (wastage_weight_MT / parent_available_MT) × 100
overall_utilization  = (total_expected_weight_MT / parent_available_MT) × 100
```

### 6.4 Cutting Calculations (per output row)

```javascript
// Packet weight
packet_weight_MT = round(
  (((thickness_mm × width_mm × length_mm) / 1_000_000) × 7.85 × sheets_per_packet) / 1000,
  2
)

// Total weight
total_weight_MT = packet_weight_MT × number_of_packets

// Total pieces
total_pieces = sheets_per_packet × number_of_packets

// Per material summary
total_length_required_mm = Σ (target_length_mm × total_pieces)
available_length_mm      = (source_coil_weight_kg × 1000 / (thickness_mm × width_mm × 7.85)) × 1000
head_tail_scrap_mm       = available_length_mm - total_length_required_mm
wastage_pct              = (head_tail_scrap_mm / available_length_mm) × 100
utilization_pct          = (total_length_required_mm / available_length_mm) × 100

// Overall summary
total_expected_weight_MT = Σ all output total_weight_MT
total_input_weight_MT    = Σ selected coil weights
expected_residual_MT     = total_input_weight_MT - total_expected_weight_MT
combined_wastage_pct     = (expected_residual_MT / total_input_weight_MT) × 100
overall_utilization      = (total_expected_weight_MT / total_input_weight_MT) × 100
```

---

## 7. Validation Rules

### 7.1 Slitting

| Rule | Condition | Message |
|---|---|---|
| V-S-01 | `target_width > 0` | "Target width must be greater than 0." |
| V-S-02 | `target_width < parent_coil_width` | "Target width must be less than parent coil width." |
| V-S-03 | `Σ(target_width × no_of_slits) ≤ parent_coil_width` | "Total output width exceeds coil width." |
| V-S-04 | `no_of_slits > 0` | "Number of slits must be at least 1." |
| V-S-05 | `parts_per_coil ≥ 0` | "Parts per coil cannot be negative." |
| V-S-06 | `total_output_weight + wastage_weight ≈ parent_coil_weight (±0.5%)` | Flag for review if out of tolerance. |

### 7.2 Cutting

| Rule | Condition | Message |
|---|---|---|
| V-C-01 | `target_length > 0` | "Target length must be greater than 0." |
| V-C-02 | `sheets_per_packet > 0` | "Sheets per packet must be at least 1." |
| V-C-03 | `number_of_packets > 0` | "Number of packets must be at least 1." |
| V-C-04 | `total_length_required ≤ available_length` | "Insufficient material. Required: Xmm, Available: Ymm." |
| V-C-05 | `total_expected_weight + residual ≈ total_input (±0.5%)` | Flag for review if out of tolerance. |

### 7.3 Common Guards

- Division by zero: All formulas shall use `|| 1` or `IFERROR`-equivalent handling.
- NaN / Infinity checks on all calculated fields — display 0 on invalid calculation.
- At least one coil must be selected to proceed to output planning.
- At least one output row per operation must be defined to proceed to Review.

---

## 8. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-WO-01 | All auto-calculated fields must update within 200ms of the triggering input change. | Performance |
| NFR-WO-02 | The coil filter list must load within 2 seconds for up to 1,000 coils. | Performance |
| NFR-WO-03 | WO data must be persisted on every "Save as Draft" within 500ms. | Reliability |
| NFR-WO-04 | The wizard must be fully usable on tablet (1024px wide) and desktop (1280px+). | Responsiveness |
| NFR-WO-05 | All state transitions must be recorded in the audit trail with accurate timestamps (UTC). | Auditability |
| NFR-WO-06 | Calculated weight values shall be rounded to 3 decimal places for MT; lengths to 0 decimal places for mm. | Accuracy |
| NFR-WO-07 | The module must support concurrent WO creation by multiple Production Managers without data collision. | Concurrency |

---

## 9. Data Model Notes

### Work Order Entity (Key Fields)

| Field | Type | Notes |
|---|---|---|
| `wo_id` | UUID | Auto-generated |
| `wo_number` | String | Auto-generated, human-readable (e.g., WO-2026-0042) |
| `status` | Enum | Draft, Pending, In Progress, On Hold, Completed, Discarded, Aborted |
| `priority` | Enum | Low, Medium, High |
| `due_date` | Date | User-entered |
| `start_date` | Date | Set on Release |
| `customer_ids` | Array<UUID> | From customer master |
| `fg_spec` | Object | Category, Grade, Thickness range, Width range, Coating, Surface, Item Type, Qty |
| `operation_sequence` | Enum | Cutting, Slitting, Slitting+Cutting |
| `selected_coils` | Array<UUID> | From inventory |
| `outputs` | Array<Object> | Per-operation planned outputs |
| `line_machine` | Array<Object> | Per-operation line and machine assignments |
| `abort_reason` | String | Populated on Abort |
| `audit_trail` | Array<Object> | [{timestamp, user, event, from_status, to_status}] |

---

## 10. Open Questions

| # | Question | Status | Resolution |
|---|---|---|---|
| OQ-1 | Should the WO be linked to a specific Sales Order at creation? | Closed | Remain standalone for now. |
| OQ-2 | Can a single WO contain outputs for multiple customers? | Closed | Yes, but mapping specific output rows to customers is out of scope. |
| OQ-3 | Who has authority to Abort a WO? | Closed | All manufacturing users for now. |
| OQ-4 | Should Priority be manually set or derived? | Closed | Manually set via High/Medium/Low radio buttons at the top. |
| OQ-5 | Override logic for calculated vs user-entered length? | Closed | User-entered length always takes precedence. |
| OQ-6 | Inventory handling on mid-production Abort? | Closed | Return to available stock. Handling this mid-process is Out of Scope (tagged Critical). |
| OQ-7 | Max output rows per operation? | Closed | Limit to 10 rows per operation. No performance cap required. |

---

## 11. Out of Scope

The following items are explicitly excluded from the current version of the Work Order Module:

1.  **Output-to-Customer Mapping**: In WOs with multiple customers, the system will not track which specific slit or cut output belongs to which customer.
2.  **Granular Abort Authorization**: Restricting "Abort" actions to specific roles (e.g., Plant Manager) is not required; all manufacturing users can currently perform this.
3.  **Mid-Stage Inventory Reconciliation**: Complex automated handling of partial inventory consumption for WOs aborted deep into the production cycle (though marked as a critical business item for future versions).
4.  **Performance Caps for Large WOs**: No specific software caps are needed for large numbers of output rows beyond the UI limit of 10.


---

*Document end. Next: See PRD-production-process-module.md for the downstream Production Process Module specification.*
