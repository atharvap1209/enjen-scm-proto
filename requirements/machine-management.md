# Machine Management – Functional Flow Document

## 1. Module Overview

The Machine Management module manages:

- Machine master data  
- Machine operational state  
- Breakdown reporting (unplanned downtime)  
- Preventive & corrective maintenance scheduling  
- State-driven production blocking  

Each machine must always be in exactly one operational state.

---

# 2. Machine States

## 2.1 Allowed States

1. Active  
2. Under Breakdown  
3. Under Corrective Maintenance  
4. Under Preventive Maintenance  
5. Inactive (optional future use)  

Only one state allowed at a time.

---

# 3. Machine Listing Screen

### Columns:
- Machine Code  
- Name  
- Type  
- Model Number  
- Serial Number  
- Production Line  
- Status  
- Next Maintenance Date  

### Behavior:
- Status reflects real-time machine state.
- Next Maintenance Date shows next scheduled Preventive Maintenance (if any).
- If breakdown exists → status must override to “Under Breakdown”.

---

# 4. Breakdown Flow

## 4.1 Trigger

User clicks **“Report Breakdown”**.

## 4.2 Required Fields

- Machine (auto-filled)  
- Machine Code (auto-filled)  
- Breakdown Start Time  
- Breakdown Reason  
- Priority  
- Reported By  
- Symptoms / Description  
- Immediate Actions Taken  
- Affected Work Order (optional but validated if entered)  

---

## 4.3 Validations

On submission:

1. Machine must be in state = Active  
2. No open breakdown record for this machine  
3. No active maintenance in progress  
4. Breakdown start time ≤ current time  
5. If work order entered → must be open & assigned to this machine  

If any fail → block submission.

---

## 4.4 System Actions After Submission

- Create Breakdown Record (Status = Open)  
- Update Machine State → Under Breakdown  
- Block:
  - Production execution  
  - Preventive maintenance scheduling  
  - Capacity allocation  

---

# 5. Maintenance Flow

Two types:

1. Preventive (Planned)  
2. Corrective (Linked to Breakdown)  

---

# 6. Preventive Maintenance Flow

## 6.1 Trigger

User clicks **“Schedule Maintenance”**.

## 6.2 Required Fields

- Machine  
- Maintenance Type = Preventive  
- Technician  
- Scheduled Date  
- Schedule Time  
- Estimated Duration  
- Estimated Cost  

---

## 6.3 Validations

1. Machine state must be Active  
2. No open breakdown  
3. No overlapping maintenance window  
4. Scheduled datetime ≥ current datetime  
5. Cannot overlap production schedule  

If any fail → block scheduling.

---

## 6.4 State Transitions

At maintenance start time:
- Machine → Under Preventive Maintenance  

On completion:
- Machine → Active  

---

# 7. Corrective Maintenance Flow

## 7.1 Trigger

Only allowed if:
- Breakdown Status = Open  

Maintenance Type must be = Corrective.

---

## 7.2 Validations

1. Breakdown must exist and be Open  
2. No other maintenance active  
3. Technician assigned  

Preventive type not allowed during breakdown.

---

## 7.3 System Actions

When corrective maintenance starts:
- Machine → Under Corrective Maintenance  
- Breakdown Status → In Repair  

When corrective maintenance completes:
- Breakdown → Closed  
- Machine → Active  

---

# 8. Inline Status Controls (Machine Details)

To ensure operational efficiency, state transitions for maintenance completion are triggered directly from the maintenance record list within the Machine Details view:

1.  **In Progress Record**: Displays a **"Complete"** button. Clicking this moves the maintenance to "Completed", closes any linked breakdowns, and resets the machine state to "Active". (Note: Starting maintenance is handled by the system or primary scheduling flows to avoid conflicts with active production).

---

# 9. Overlap & Conflict Rules

## 8.1 Only One Open Breakdown  
Per machine at any time.

## 8.2 Only One Active Maintenance  
Per machine at any time.

## 8.3 No Time Overlap  
Maintenance windows cannot overlap each other.

## 8.4 Production Locking  
When Machine ≠ Active:
- Cannot start work order  
- Cannot allocate capacity  
- Cannot post production output  

---

# 9. State Transition Matrix

| Current State | Action | New State |
|---------------|--------|-----------|
| Active | Report Breakdown | Under Breakdown |
| Under Breakdown | Inline "Start" Corrective Maintenance | Under Corrective Maintenance |
| Under Corrective Maintenance | Inline "Complete" | Active |
| Active | Inline "Start" Preventive Maintenance | Under Preventive Maintenance |
| Under Preventive Maintenance | Inline "Complete" | Active |

---

# 10. Database-Level Constraints (Mandatory)

Enforce:

- Unique open breakdown per machine  
- Unique active maintenance per machine  
- Foreign key: Corrective Maintenance → Breakdown ID  
- Machine state must auto-update via transaction  
- Breakdown cannot close if corrective maintenance incomplete  

---

# 11. Reporting Impact

Machine Downtime =  
Breakdown Duration + Corrective Maintenance Duration  

Preventive Maintenance tracked separately.

This ensures:
- Accurate OEE  
- Accurate MTTR  
- Accurate MTBF  

---

# 12. Core Rule Clarification

- Preventive Maintenance cannot be scheduled when a Breakdown is open.  
- Corrective Maintenance is allowed only if linked to that Breakdown.  
- Machine state transitions must be system-driven, not manually editable.