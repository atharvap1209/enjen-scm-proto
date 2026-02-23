# Product Requirements Document
# Production Process Module — Steel Coil Processing ERP

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
4. [Relationship to Work Order Module](#4-relationship-to-work-order-module)
5. [User Stories & Requirements](#5-user-stories--requirements)
   - [US-PP-01: View Production Process Task Listing](#us-pp-01-view-production-process-task-listing)
   - [US-PP-02: Start a Production Stage](#us-pp-02-start-a-production-stage)
   - [US-PP-03: Hold & Resume a Production Stage](#us-pp-03-hold--resume-a-production-stage)
   - [US-PP-04: Complete a Cutting Stage — Capture Actuals & Variance](#us-pp-04-complete-a-cutting-stage--capture-actuals--variance)
   - [US-PP-05: Complete a Slitting Stage — Capture Actuals & Variance](#us-pp-05-complete-a-slitting-stage--capture-actuals--variance)
   - [US-PP-06: Complete a Slitting + Cutting Stage — Capture Actuals & Variance](#us-pp-06-complete-a-slitting--cutting-stage--capture-actuals--variance)
   - [US-PP-07: Mark Actuals Equal to Planned (Quick-Set)](#us-pp-07-mark-actuals-equal-to-planned-quick-set)
   - [US-PP-08: View Coil Status After Stage Completion](#us-pp-08-view-coil-status-after-stage-completion)
   - [US-PP-09: Navigate to Next Stage After Completion](#us-pp-09-navigate-to-next-stage-after-completion)
   - [US-PP-10: Final Stage Completion & Work Order Closure](#us-pp-10-final-stage-completion--work-order-closure)
   - [US-PP-11: QC Gating Per Stage (Settings-Controlled)](#us-pp-11-qc-gating-per-stage-settings-controlled)
6. [Functional Requirements Summary](#6-functional-requirements-summary)
7. [Calculation Specifications — Actuals & Variance](#7-calculation-specifications--actuals--variance)
8. [Validation Rules](#8-validation-rules)
9. [Stage Lifecycle State Machine](#9-stage-lifecycle-state-machine)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Data Model Notes](#11-data-model-notes)
12. [Open Questions](#12-open-questions)
13. [Out of Scope](#13-out-of-scope)

---

## 1. Overview & Purpose

The Production Process Module tracks the **execution** of a Work Order on the shop floor. Where the Work Order Module is about **planning** (what should be produced, from which coils, with what dimensions), the Production Process Module is about **tracking actuals** (what was actually produced, how much material was used, and where the variance lies).

Each Work Order generates one or more **production stages** — one stage per operation (Slitting, Cutting). The Production Process Module:

- Lists all production stages across all Work Orders.
- Controls stage lifecycle: Not Started → In Progress → On Hold → Completed.
- Captures actual outputs versus planned outputs at completion time.
- Auto-calculates variance at the line item level.
- Tracks coil balance (Original Weight, Utilized Weight, Balance Weight) per coil.
- Supports QC gating before stage advancement (configurable per-stage in Settings).
- Drives Work Order status updates (WO moves to `Completed` when the last stage completes).

---

## 2. Personas & Actors

| Persona | Role | Key Interactions |
|---|---|---|
| **Production Manager** | Oversees production | Reviews stage progress, resolves holds, views variance |
| **Shift Supervisor / Operator** | Shop floor execution | Starts stages, enters actuals, completes stages |
| **QC Inspector** | Quality gating | Passes or rejects stages at QC checkpoints |
| **Plant Manager** | Oversight | Views listing, monitors utilisation and on-time completion |
| **System / ERP** | Automated triggers | Creates stages on WO submit, closes WO on last stage completion |

---

## 3. Module Architecture Summary

```
Production Process Module
 ├── Stage Listing (all stages, filterable)
 └── Stage Detail (side panel or full-screen)
      ├── Stage Header (WO No., Operation, Customer, Machine, Line)
      ├── Stage Action CTAs (Start / Hold / Resume / Complete)
      ├── Complete Stage Panel
      │    ├── Clean Summary (WO No., Operation Type, Customer)
      │    ├── Planned vs. Actual Output Tables
      │    │    ├── Case 1: Cutting Only
      │    │    ├── Case 2: Slitting Only
      │    │    └── Case 3: Slitting + Cutting (two tables)
      │    ├── Coil Status Table
      │    └── Complete Stage CTA
      └── Success State (Go to Next Stage / Go to WO / Create WO / Go to Listing)
```

---

## 4. Relationship to Work Order Module

| Event in WO Module | Effect in Production Process / QC Module |
|---|---|
| WO Submitted (status → Pending) | Production Process tasks created for each operation; **Loading QC task** created in QC Module. |
| WO Released (status → In Progress) | First stage becomes "In Progress". |
| WO set to On Hold | Active stage moves to `On Hold`. |
| WO Resumed | On-Hold stage moves back to `In Progress`. |
| WO Discarded (from Pending) | All associated tasks deleted; **Loading QC task deleted** in QC Module. |
| WO Aborted (from In Progress / On Hold) | All stages set to `Aborted`. |
| Stage Actuals Submitted | **Stage QC task** (Cutting QC or Slitting QC) created in QC Module. |
| Last stage Completed | WO status → `Completed`. |

---

## 5. User Stories & Requirements

---

### US-PP-01: View Production Process Task Listing

**As a** Production Manager or Plant Manager,  
**I want to** see all production stages across all Work Orders in a centralised list,  
**So that** I can monitor progress, identify bottlenecks, and drill into specific stages.

#### 5.1.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-001 | The listing shall display each stage as a row with columns: WO Number, Stage Name, Operation Type, Customer Name, Machine, Line, Status, Priority. | Must Have |
| PP-REQ-002 | Stages shall be sortable by any column. | Must Have |
| PP-REQ-003 | Stages shall be filterable by: Status, Operation Type, Customer, Machine, Line, Priority. | Must Have |
| PP-REQ-004 | A search bar shall allow search by WO Number or Customer Name. | Should Have |
| PP-REQ-005 | Status shall be colour-coded: Not Started (grey), In Progress (blue), On Hold (orange), Completed (green), Aborted (red). | Should Have |
| PP-REQ-006 | Clicking a stage row shall open the Stage Detail view (side panel or full screen). | Must Have |
| PP-REQ-007 | Pagination or infinite scroll shall support large stage lists. | Must Have |

#### 5.1.2 Acceptance Criteria

- [ ] All required columns appear in the correct order.
- [ ] Filter by Status = "In Progress" returns only stages with that status.
- [ ] Status badges are correctly colour-coded per PP-REQ-005.
- [ ] Clicking a row opens the Stage Detail without navigation away from the listing.

---

### US-PP-02: Start a Production Stage

**As a** Shift Supervisor,  
**I want to** start the first (or next) stage of a Work Order,  
**So that** production tracking begins and the shop floor knows execution has started.

#### 5.2.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-008 | When a stage status = `Not Started`, the only available CTA is **Start Stage**. | Must Have |
| PP-REQ-009 | **Start Stage** shall only be clickable if the preceding stage (if any) has status = `Completed`. | Must Have |
| PP-REQ-010 | For the first stage of a WO, **Start Stage** is available immediately upon WO Release. Note: Before starting (or before any actuals are entered), the user may perform a "Swap Coil" via the Work Order Detail view (see US-WO-13). | Must Have |
| PP-REQ-011 | On clicking **Start Stage**: stage status changes to `In Progress`, and a start timestamp is recorded. | Must Have |
| PP-REQ-012 | When stage status = `In Progress`, available CTAs are **Hold** and **Complete Stage**. | Must Have |

#### 5.2.2 Acceptance Criteria

- [ ] Start Stage on a second stage is disabled (greyed out with tooltip) if the first stage is not yet Completed.
- [ ] Clicking Start Stage on an eligible stage immediately changes status to `In Progress`.
- [ ] After starting, the CTAs shown are Hold and Complete Stage (not Start Stage).
- [ ] Start timestamp is stored and displayed in the audit trail.

---

### US-PP-03: Hold & Resume a Production Stage

**As a** Shift Supervisor,  
**I want to** put a stage on hold when production must pause (e.g., machine breakdown, shift change),  
**So that** the system accurately reflects the current state and metrics aren't skewed.

#### 5.3.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-013 | When stage status = `In Progress`: **Hold** CTA is available. | Must Have |
| PP-REQ-014 | Clicking **Hold**: stage status → `On Hold`. Parent WO status → `On Hold`. | Must Have |
| PP-REQ-015 | When stage status = `On Hold`: only **Resume** CTA is available. | Must Have |
| PP-REQ-016 | Clicking **Resume**: stage status → `In Progress`. Parent WO status → `In Progress`. | Must Have |
| PP-REQ-017 | Hold and Resume events are logged in the audit trail with timestamp and user. | Must Have |
| PP-REQ-018 | A user cannot take any output-related action (enter actuals, complete) while a stage is On Hold. | Must Have |

#### 5.3.2 Acceptance Criteria

- [ ] Hold button appears only when stage is In Progress.
- [ ] After Hold, both stage and WO status reflect `On Hold`.
- [ ] Resume button appears only when stage is On Hold.
- [ ] After Resume, both stage and WO status reflect `In Progress`.
- [ ] All Hold/Resume events are timestamped in the audit trail.
- [ ] Actuals entry fields are disabled when stage is On Hold.

---

### US-PP-04: Complete a Cutting Stage — Capture Actuals & Variance

**As a** Shift Supervisor,  
**I want to** enter the actual number of pieces produced and actual weight for each planned cutting output, and have the system calculate variance automatically,  
**So that** we have an accurate record of what was produced versus what was planned.

#### 5.4.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-019 | The Complete Stage panel for Cutting shall display a **Clean Summary**: WO Number, Operation Type, Customer Name. | Must Have |
| PP-REQ-020 | A **Planned vs. Actuals table** shall show the following columns for each output row: Part Name, Coil Number, Length, Number of Pieces (planned), Weight MT (planned), Leftover % (planned), Actual No. of Pieces (user input), Actual Weight MT (user input), Actual Leftover % (auto-calculated), Variance % (auto-calculated). | Must Have |
| PP-REQ-021 | **Actual Leftover %**: auto-calculated from actual weight relative to the coil's original weight. Formula: `actual_leftover_pct = ((coil_original_weight - actual_utilized_weight) / coil_original_weight) × 100` | Must Have |
| PP-REQ-022 | **Variance %**: `variance_pct = ((actual_weight - planned_weight) / planned_weight) × 100`. Positive = over-produced; Negative = under-produced. Display with a +/- sign. | Must Have |
| PP-REQ-023 | **Coil Status Table** shall appear below the actuals table showing for each coil: Coil Number, Original Weight (MT), Utilized Weight (MT), Balance Weight (MT). | Must Have |
| PP-REQ-024 | Coil Status: `balance_weight = original_weight - utilized_weight`. Utilized Weight = sum of actual weights of all outputs drawn from that coil. | Must Have |
| PP-REQ-025 | All user-editable fields (Actual No. of Pieces, Actual Weight) shall accept numeric input only. | Must Have |
| PP-REQ-026 | A **"Mark Actual = Planned"** toggle/button shall be available per table section (see US-PP-07). | Must Have |
| PP-REQ-027 | The **Complete Stage** CTA shall be disabled until all Actual Weight fields have a valid value (non-empty, non-zero). | Must Have |

#### 5.4.2 Acceptance Criteria

- [ ] Planned values (pieces, weight, leftover %) are pre-populated from the WO and are read-only.
- [ ] Entering Actual Weight auto-calculates Actual Leftover % without user action.
- [ ] Variance % shows immediately on entering Actual Weight, with correct sign.
- [ ] Coil Status table updates in real time as actual weights are entered.
- [ ] Complete Stage is disabled while any Actual Weight field is empty.
- [ ] Submitting the Complete Stage action stores both planned and actual values.

---

### US-PP-05: Complete a Slitting Stage — Capture Actuals & Variance

**As a** Shift Supervisor,  
**I want to** enter the actual weight produced for each slit output, and have the system calculate actual leftover and variance automatically,  
**So that** coil utilisation is tracked accurately after slitting.

#### 5.5.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-028 | The Complete Stage panel for Slitting shall display a **Clean Summary**: WO Number, Operation Type, Customer Name. | Must Have |
| PP-REQ-029 | A **Planned vs. Actuals table** shall show: Part Name, Coil Number, Width (mm), Number of Slit Coils (planned), Weight MT (planned), Leftover % (planned), Actual Weight MT (user input), Actual Leftover % (auto-calculated), Variance % (auto-calculated). | Must Have |
| PP-REQ-030 | **Actual Leftover %**: `actual_leftover_pct = ((coil_original_weight - Σ actual_weights_from_this_coil) / coil_original_weight) × 100` | Must Have |
| PP-REQ-031 | **Variance %**: `variance_pct = ((actual_weight - planned_weight) / planned_weight) × 100` | Must Have |
| PP-REQ-032 | **Coil Status Table** shall appear below showing: Coil Number, Original Weight (MT), Utilized Weight (MT), Balance Weight (MT). | Must Have |
| PP-REQ-033 | The **"Mark Actual = Planned"** quick-set shall be available per section. | Must Have |
| PP-REQ-034 | Complete Stage CTA is disabled until all Actual Weight fields are filled. | Must Have |

#### 5.5.2 Acceptance Criteria

- [ ] Planned values are pre-populated and read-only.
- [ ] Actual Weight input triggers auto-calculation of Actual Leftover % and Variance %.
- [ ] Coil Status reflects correct balance after actuals are entered.
- [ ] Mark Actual = Planned fills all actual fields with planned values in one action.
- [ ] Complete Stage stores slitting actuals with all calculated fields.

---

### US-PP-06: Complete a Slitting + Cutting Stage — Capture Actuals & Variance

**As a** Shift Supervisor,  
**I want to** enter actuals for both the slitting and cutting steps within the same stage,  
**So that** variance is captured at both the intermediate (slit) and final (sheet) output levels.

#### 5.6.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-035 | The Complete Stage panel for Slitting+Cutting shall display two separate actuals tables: **Slitting Output** and **Cutting Output**. | Must Have |
| PP-REQ-036 | **Slitting Output table** columns: Part Name, Coil Number, Width (mm), No. of Slit Coils (planned), Weight MT (planned), Leftover % (planned), Actual Weight MT (user input), Actual Leftover % (auto-calc), Variance % (auto-calc). | Must Have |
| PP-REQ-037 | **Cutting Output table** columns: Part Name, From Slit (Part Name), Coil Number, Width (mm), Length, No. of Pieces (planned), Weight MT (planned), Leftover % (planned), Actual No. of Pieces (user input), Actual Weight MT (user input), Actual Leftover % (auto-calc), Variance % (auto-calc). | Must Have |
| PP-REQ-038 | "From Slit" in the Cutting table references the Part Name from the Slitting table — establishing traceability between slit coil and final sheet. | Must Have |
| PP-REQ-039 | **Coil Status Table** reflects the combined utilisation from both sub-operations. | Must Have |
| PP-REQ-040 | **"Mark Actual = Planned"** toggle is available independently per section (Slitting section and Cutting section). | Must Have |
| PP-REQ-041 | Complete Stage CTA is disabled until all Actual Weight fields in both tables are filled. | Must Have |

#### 5.6.2 Acceptance Criteria

- [ ] Both Slitting and Cutting output tables render independently with their own column sets.
- [ ] "From Slit" column correctly shows the linked slit part name.
- [ ] Mark Actual = Planned in Slitting section fills only slitting actuals; same for Cutting section.
- [ ] Coil Status combines weights from both slitting and cutting outputs correctly.
- [ ] Variance is computed separately per row in both tables.
- [ ] Complete Stage is blocked if any field in either table is empty.

---

### US-PP-07: Mark Actuals Equal to Planned (Quick-Set)

**As a** Shift Supervisor,  
**I want to** quickly mark all actuals as equal to planned values for a section with one click,  
**So that** I don't have to manually type in identical values when output matches the plan exactly.

#### 5.7.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-042 | Each actuals table section shall have a **"Mark Actual = Planned"** button or toggle, clearly associated with that section. | Must Have |
| PP-REQ-043 | Clicking this sets all user-input actual fields in that section to the corresponding planned values. | Must Have |
| PP-REQ-044 | After quick-set, Actual Leftover % and Variance % auto-recalculate (Variance should = 0 when actual = planned). | Must Have |
| PP-REQ-045 | The user can still override individual fields after using quick-set. | Must Have |
| PP-REQ-046 | If actual ≠ original after editing, the system replaces the stored "planned" record with the actual values in inventory. | Must Have |

#### 5.7.2 Acceptance Criteria

- [ ] Clicking "Mark Actual = Planned" fills all actual fields with exact planned values.
- [ ] Variance % = 0.00% for all rows after quick-set.
- [ ] Individual fields remain editable after quick-set.
- [ ] If a field is overridden post-quick-set, Variance % updates accordingly.

---

### US-PP-08: View Coil Status After Stage Completion

**As a** Production Manager,  
**I want to** see the consumed weight, remaining weight, and original weight for each coil involved in a stage,  
**So that** I have full traceability of coil consumption per production run.

#### 5.8.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-047 | The **Coil Status Table** shall be displayed at the bottom of the Complete Stage panel. | Must Have |
| PP-REQ-048 | Columns: Coil Number, Original Weight (MT), Utilized Weight (MT), Balance Weight (MT). | Must Have |
| PP-REQ-049 | **Utilized Weight** = sum of Actual Weights of all output rows sourced from that coil in this stage. | Must Have |
| PP-REQ-050 | **Balance Weight** = Original Weight − Utilized Weight. | Must Have |
| PP-REQ-051 | Coil Status table updates in real time as actual weight fields are entered. | Must Have |
| PP-REQ-052 | On stage completion, the Coil Status shall be persisted and the inventory record for each coil updated with the new balance weight. | Must Have |
| PP-REQ-053 | If Balance Weight < 0, show a warning: "Utilized weight exceeds original coil weight for COIL-XXX." Stage completion shall be blocked until corrected. | Must Have |

#### 5.8.2 Acceptance Criteria

- [ ] Coil Status table shows one row per selected coil.
- [ ] Utilized Weight sums correctly across multiple outputs from the same coil.
- [ ] Balance Weight = Original − Utilized, shown to 3 decimal places.
- [ ] Negative Balance Weight triggers a visible warning and blocks stage completion.
- [ ] On completion, inventory records for all coils reflect updated balance weights.

---

### US-PP-09: Navigate to Next Stage After Completion

**As a** Shift Supervisor,  
**I want to** be taken directly to the next stage after completing the current one,  
**So that** production flow is uninterrupted and I don't have to navigate back to the listing manually.

#### 5.9.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-054 | On Stage Completion (not the final stage): a **success state** is displayed with: Primary CTA — **Go to Next Stage** (opens next stage detail with Start Stage ready), Secondary CTA — **Go to Work Order**. | Must Have |
| PP-REQ-055 | "Go to Next Stage" navigates to the next stage's detail panel with status = `Not Started` and Start Stage available. | Must Have |
| PP-REQ-056 | "Go to Work Order" navigates to the WO Detail view. | Must Have |
| PP-REQ-057 | The completed stage's status must be `Completed` before the next stage becomes startable. | Must Have |

#### 5.9.2 Acceptance Criteria

- [ ] After completing a non-final stage, the success state with two CTAs is shown.
- [ ] Clicking "Go to Next Stage" opens the next stage panel in `Not Started` state with Start Stage CTA enabled.
- [ ] Clicking "Go to Work Order" navigates to the correct WO Detail page.

---

### US-PP-10: Final Stage Completion & Work Order Closure

**As a** Shift Supervisor,  
**I want to** complete the last stage of a Work Order and have the WO automatically marked as Completed,  
**So that** the production cycle is formally closed and I can immediately start a new WO if needed.

#### 5.10.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-058 | When the final stage of a WO is completed: WO status → `Completed`. | Must Have |
| PP-REQ-059 | The success state for the final stage shall show: Primary CTA — **Create Work Order** (navigates to WO creation wizard), Secondary CTA — **Go to Production Process Listing**. | Must Have |
| PP-REQ-060 | "Go to Production Process Listing" navigates back to the main stage listing. | Must Have |
| PP-REQ-061 | A completion timestamp shall be recorded in the WO's audit trail. | Must Have |

#### 5.10.2 Acceptance Criteria

- [ ] Completing the last stage changes WO status to `Completed`.
- [ ] Success state shows "Create Work Order" and "Go to Production Process Listing" CTAs.
- [ ] WO Detail view shows status `Completed` with no action CTAs.
- [ ] Audit trail shows final completion timestamp and acting user.

---

### US-PP-11: QC Task Creation & Gating (Cross-Module Integration)

**As a** QC Inspector and Production Manager,  
**I want** quality control tasks to be automatically generated in the **QC Module** during the production lifecycle,  
**So that** quality standards are enforced via the specialized QC interface before material moves to the next stage.

#### 5.11.1 Requirements

| ID | Requirement | Priority |
|---|---|---|
| PP-REQ-062 | **Loading QC Task**: On WO submission, the system shall automatically create a "Loading QC" task in the separate QC Module. | Must Have |
| PP-REQ-063 | **Stage QC Task**: On "Complete Stage" submission (actuals entered), the system shall create an operation-specific QC task (e.g., "Cutting QC" or "Slitting QC") in the QC Module. | Must Have |
| PP-REQ-064 | **Cleanup**: If a Pending WO is discarded, the associated Loading QC task shall be deleted from the QC Module. | Must Have |
| PP-REQ-065 | **Cross-Module Gating**: If QC Gating is enabled in Settings for the stage type, the production stage cannot move to `Completed` until the corresponding QC Task in the QC Module is marked as "Passed". | Must Have |
| PP-REQ-066 | **Fail Handling**: If a Stage QC task is "Failed" in the QC Module, the production stage remains `In Progress` in this module for correction. | Must Have |
| PP-REQ-067 | The QC Gating enforcement (blocking stage completion) can be enabled/disabled per stage type in system Settings. | Must Have |
| PP-REQ-068 | If QC Gating is disabled, the stage shall move to `Completed` immediately upon actuals submission (if it is the final stage) or become eligible for the success state (intermediate stage). | Must Have |

#### 5.11.2 Acceptance Criteria

- [ ] Creating a Work Order immediately generates a "Loading QC" task in the QC Module.
- [ ] Discarding a Pending WO removes the "Loading QC" task from the QC Module.
- [ ] Submitting Cutting stage actuals generates a "Cutting QC" task in the QC Module.
- [ ] Submitting Slitting stage actuals generates a "Slitting QC" task in the QC Module.
- [ ] Production stage status is blocked in `Pending QC` until the external QC task is passed (only if gating is enabled).
- [ ] If QC gating is disabled, stage moves directly to `Completed` or success state upon actuals submission.
- [ ] Failing an external QC task returns the stage to `In Progress` with visibility of the failure reason.

---

## 6. Functional Requirements Summary

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-PP-01 | Production Process tasks are auto-created per WO operation on WO submission. | Must Have |
| FR-PP-02 | Stage listing with all required columns, filtering, sorting, and search. | Must Have |
| FR-PP-03 | Stage lifecycle management: Not Started → In Progress → On Hold → Completed (with QC intercept if enabled). | Must Have |
| FR-PP-04 | Stage start is gated on previous stage completion (sequential execution enforced). | Must Have |
| FR-PP-05 | Actuals capture form adapts per operation type: Cutting, Slitting, or Slitting+Cutting. | Must Have |
| FR-PP-06 | Auto-calculation of Actual Leftover %, Variance %, and Coil Balance Weight in real time. | Must Have |
| FR-PP-07 | Coil Status Table per stage showing Original, Utilized, and Balance Weight. | Must Have |
| FR-PP-08 | Mark Actual = Planned quick-set per table section. | Must Have |
| FR-PP-09 | On final stage completion, WO status auto-updates to `Completed`. | Must Have |
| FR-PP-10 | Inventory coil balances updated on stage completion. | Must Have |
| FR-PP-11 | Success state CTAs contextually change based on whether the completed stage is final or intermediate. | Must Have |
| FR-PP-12 | Cross-module task creation: "Loading QC" on WO submit, and operation-specific QC on stage completion. | Must Have |
| FR-PP-13 | Automatic deletion of "Loading QC" tasks when a Work Order is discarded. | Must Have |
| FR-PP-14 | Stage lifecycle management: Not Started → In Progress → On Hold → Completed (with QC gating via external QC Module). | Must Have |
| FR-PP-15 | Full audit trail for all stage events: Start, Hold, Resume, QC Pass, QC Fail, Complete. | Must Have |
| FR-PP-16 | Stages move to `On Hold` / `Aborted` when parent WO is set to On Hold / Aborted. | Must Have |

---

## 7. Calculation Specifications — Actuals & Variance

### 7.1 Actual Leftover % (all operation types)

```javascript
// For a given coil, after entering actuals:
actual_utilized_weight_MT = Σ actual_weight_MT for all outputs from that coil

actual_leftover_pct = (
  (coil_original_weight_MT - actual_utilized_weight_MT) / coil_original_weight_MT
) × 100
```

### 7.2 Variance % (line-item level)

```javascript
// Applies to both weight and pieces
variance_weight_pct = ((actual_weight_MT - planned_weight_MT) / planned_weight_MT) × 100
// Display as: "+X.XX%" (over-produced) or "-X.XX%" (under-produced)

// For piece count (Cutting only)
variance_pieces_pct = ((actual_pieces - planned_pieces) / planned_pieces) × 100
```

### 7.3 Coil Status (per coil, per stage)

```javascript
// Utilized Weight = sum of all actual output weights sourced from this coil
utilized_weight_MT = Σ actual_weight_MT (outputs with this coil as source)

// Balance Weight
balance_weight_MT = original_weight_MT - utilized_weight_MT
// If balance_weight_MT < 0: show error, block stage completion
```

### 7.4 Cutting Actual Leftover % (per output row)

```javascript
// Leftover % at sheet/cutting level is based on material consumed for this specific output
// vs the coil's original weight attribution for this output

actual_leftover_pct_per_output = (
  (planned_weight_MT - actual_weight_MT) / planned_weight_MT
) × 100
// Alternatively, if per-coil tracking is needed:
// actual_leftover_pct = coil-level leftover%, allocated proportionally
```

### 7.5 Slitting Actual Leftover %

```javascript
// Same formula as coil-level leftover
// Each slit output contributes to overall coil utilisation
actual_leftover_pct = (
  (coil_original_weight_MT - Σ actual_slit_weights_from_this_coil) / coil_original_weight_MT
) × 100
```

---

## 8. Validation Rules

### 8.1 Stage Transition Validations

| Rule | Condition | Behavior |
|---|---|---|
| V-PP-01 | Stage can only be Started if previous stage = `Completed` (or it is first stage). | Block with tooltip: "Previous stage must be completed first." |
| V-PP-02 | Stage can only be Completed if all Actual Weight fields are non-empty and > 0. | Disable Complete Stage CTA; show inline message. |
| V-PP-03 | If QC enabled: Stage Completion triggers QC Review before status → `Completed`. | — |
| V-PP-04 | QC Fail requires a mandatory reason. | Disable Fail confirm button without reason. |

### 8.2 Actuals Entry Validations

| Rule | Condition | Message |
|---|---|---|
| V-PP-05 | Actual Weight must be > 0. | "Actual weight must be greater than 0." |
| V-PP-06 | Actual No. of Pieces must be a positive integer. | "Pieces must be a positive whole number." |
| V-PP-07 | Utilized Weight (sum of actuals for a coil) must not exceed Original Weight. | "Utilized weight exceeds coil's original weight for COIL-XXX." |
| V-PP-08 | Actual Leftover % cannot be negative (derived from V-PP-07). | Block completion; highlight violating coil in Coil Status table. |

---

## 9. Stage Lifecycle State Machine

```
                    ┌──────────────────────────────────────────────────────────┐
                    │                   STAGE STATE MACHINE                    │
                    └──────────────────────────────────────────────────────────┘

  Created (on WO Submit) ──────────────────► NOT STARTED
                                                  │
                              [Previous stage Completed]
                                   Start Stage ▼
                                           IN PROGRESS ◄─────────────────────┐
                                            │      │                          │
                                           Hold   Complete Stage (+ QC if on)│
                                            │      │                          │
                                            ▼      ▼                          │
                                        ON HOLD   [QC Disabled]──────────────┤
                                            │         │                       │
                                          Resume  COMPLETED                   │
                                            │                                 │
                                            └─────────────────────────────────┘

                    WO Aborted ──────────────────────────────────► ABORTED (all stages)
```

### Allowed CTAs per Stage Status

| Stage Status | Available CTAs |
|---|---|
| Not Started | Start Stage (if previous stage Completed) |
| In Progress | Hold, Complete Stage |
| On Hold | Resume |
| Pending QC | (QC Inspector only) Pass, Fail |
| Completed | (none) |
| Aborted | (none) |

---

## 10. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-PP-01 | All actual weight entry auto-calculations (leftover %, variance %, coil balance) must render within 150ms. | Performance |
| NFR-PP-02 | Stage listing must load within 2 seconds for up to 500 concurrent stages. | Performance |
| NFR-PP-03 | Coil inventory balance updates must be atomic — partial writes are not acceptable. | Data Integrity |
| NFR-PP-04 | Audit trail entries must be append-only — no deletion or modification allowed. | Auditability |
| NFR-PP-05 | Module must function correctly on tablets (1024px) and desktops (1280px+). | Responsiveness |
| NFR-PP-06 | All weight values stored and displayed to 3 decimal places (MT). Percentages to 2 decimal places. | Accuracy |
| NFR-PP-07 | Stage status updates from WO-level Hold/Resume/Abort must propagate within 1 second. | Latency |

---

## 11. Data Model Notes

### Production Stage Entity (Key Fields)

| Field | Type | Notes |
|---|---|---|
| `stage_id` | UUID | Auto-generated |
| `wo_id` | UUID | Foreign key → Work Order |
| `stage_name` | String | e.g., "Slitting Stage 1", "Cutting Stage 1" |
| `operation_type` | Enum | Slitting, Cutting |
| `status` | Enum | Not Started, In Progress, On Hold, Pending QC, Completed, Aborted |
| `sequence_order` | Integer | 1, 2, ... (determines execution order) |
| `customer_id` | UUID | From parent WO |
| `machine_id` | UUID | From WO Line & Machine assignment |
| `line_id` | UUID | From WO Line & Machine assignment |
| `priority` | Enum | Low, Medium, High (inherited from WO) |
| `planned_outputs` | Array<Object> | Copied from WO outputs at creation time |
| `actual_outputs` | Array<Object> | Filled at stage completion |
| `coil_status` | Array<Object> | [{coil_id, original_weight, utilized_weight, balance_weight}] |
| `qc_enabled` | Boolean | From Settings at time of stage creation |
| `qc_result` | Enum | Pending, Pass, Fail, N/A |
| `qc_fail_reason` | String | Populated on QC Fail |
| `start_timestamp` | DateTime | Set on Start Stage |
| `end_timestamp` | DateTime | Set on stage Completed |
| `audit_trail` | Array<Object> | [{timestamp, user, event, from_status, to_status, notes}] |

### Planned Output Row (nested in stage)

| Field | Type | Notes |
|---|---|---|
| `part_name` | String | From WO |
| `coil_id` | UUID | Source coil reference |
| `coil_number` | String | Display reference |
| `width_mm` | Number | For Slitting outputs |
| `length_mm` | Number | For Cutting outputs |
| `no_of_pieces` | Integer | For Cutting outputs |
| `no_of_slit_coils` | Integer | For Slitting outputs |
| `planned_weight_MT` | Number | From WO calculations |
| `planned_leftover_pct` | Number | From WO calculations |
| `from_slit_part` | String | For Cutting in S+C mode; references Slitting part name |

### Actual Output Row (nested in stage, filled on completion)

| Field | Type | Notes |
|---|---|---|
| `actual_no_of_pieces` | Integer | User input (Cutting) |
| `actual_weight_MT` | Number | User input |
| `actual_leftover_pct` | Number | Auto-calculated |
| `variance_pct` | Number | Auto-calculated |

---

| # | Question | Status | Resolution |
|---|---|---|---|
| OQ-1 | QC Inspector role separation? | Closed | QC Inspector is a separate system role. |
| OQ-2 | Resubmit after QC Fail? | Closed | Should be possible, but marked as Out of Scope for this phase. |
| OQ-3 | Stagnation alerts? | Closed | Trigger alert if a stage remains In Progress or On Hold > 7 days. Configurable threshold is Out of Scope. |
| OQ-4 | Inventory generation for outputs? | Closed | No new inventory items; outputs remain linked to the original parent coil. |
| OQ-5 | Multi-WO coil allocation? | Closed | Not possible; a coil is strictly allocated to one active WO at a time. |
| OQ-6 | Re-opening completed stages? | Closed | Out of Scope. |
| OQ-7 | Coil substitution flow? | Closed | Handled via the **Swap Coil** CTA on the released Work Order (see US-WO-13). Blocks if actuals are already entered. |
| OQ-8 | Stage Completion PDF? | Closed | Not needed. |

---

## 13. Out of Scope

The following items are explicitly excluded from the current version of the Production Process Module:

1.  **Edit & Resubmit Post-QC Fail**: The intermediate flow to allow a Shift Supervisor to fix actuals and re-trigger a QC check without a full stage reset.
2.  **Configurable Alert Thresholds**: The ability for users to change the 7-day "stagnant stage" alert threshold via the Settings UI.
3.  **Post-Completion Corrections**: The ability to re-open or edit a stage once it has reached the `Completed` status.
4.  **Automatic Inventory Item Generation**: Creating distinct inventory records/IDs for every slit coil or sheet pack produced (they remain tracked as attributes of the parent coil).
5.  **Multi-WO Coil Sharing**: Real-time management of one physical coil being used across multiple different Work Orders simultaneously.


---

*Document end. For the planning phase (Work Order creation, coil selection, output planning), see PRD-work-order-module.md.*
