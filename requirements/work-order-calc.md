# Developer Handoff: Steel Coil Processing Calculations
## ERP Work Order Module - Formula Implementation Guide

**Version:** 1.0  
**Date:** February 16, 2026  
**Purpose:** Complete calculation specification for Slitting & Cutting work orders

---

## Table of Contents
1. [Overview](#overview)
2. [Slitting Process](#slitting-process)
3. [Cutting Process](#cutting-process)
4. [Field Mapping & Changes](#field-mapping--changes)
5. [Complete Formula Reference](#complete-formula-reference)
6. [Validation Rules](#validation-rules)
7. [UI Calculation Flow](#ui-calculation-flow)

---

## Overview

### Current ERP Screens
1. **Finished Goods Details** - User inputs requirements
2. **Suggested Coils** - System suggests matching coils
3. **Planned Outputs (Slitting)** - Calculate outputs and wastage
4. **Planned Outputs (Cutting)** - Calculate sheets, packets, and wastage

### Excel Reference Files
- **2024_-_November_Slitting_Plan.xlsx** - Slitting calculations
- **PROCESS_REQUEST_FORMAT_for_Sheets_.xlsx** - Cutting calculations

---

## SLITTING PROCESS

### Screen 1: Finished Goods Details

#### Current Fields (Keep As-Is)
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| Item Category | Dropdown | Product category | Yes |
| Grade/Finish | Dropdown | Material grade (e.g., ASTM A653) | Yes |
| Target Thickness (mm) | Range | Min-Max thickness | Yes |
| Target Width (mm) | Range | Min-Max width | Yes |
| Target Length (mm) | Number | Desired length | Yes |
| Coating | Dropdown | Coating type (e.g., 120 GSM) | Yes |
| Surface | Dropdown | Surface finish (e.g., Skinpass) | Yes |
| Quantity Demand | Number | Required quantity in MT | Yes |
| Customer | Dropdown | Customer name | Yes |

#### No Changes Required
All fields are appropriate for initial requirement capture.

---
### Screen 3: Allocation Summary

#### Current Fields (Keep As-Is)
| Field | Description | Calculation |
|-------|-------------|-------------|
| Coil Selected | Number of coils selected | Count of checked coils |
| Total Allocated | Total weight allocated | Sum of selected coil weights |
| Expected Residual | Remaining after processing | **NEW CALCULATION** |
| Allocation Type | Full/Partial allocation | Business logic |

#### ENHANCED CALCULATION: Expected Residual

**Current:** Shows "0.00 MT"  
**Required:** Calculate actual expected residual considering wastage

**Formula:**
```javascript
expected_residual = total_allocated - quantity_demand - estimated_wastage_total
```

---

### Screen 4: Planned Outputs and Wastage - Slitting

#### Excel Mapping: Row 2-3 (Master Coil Section)

**Excel Fields → ERP Fields:**

| Excel Cell | Excel Field | ERP Equivalent | Notes |
|------------|-------------|----------------|-------|
| B3 | Customer | From "Finished Goods Details" | Already captured |
| C3 | Date | System generated | Auto-populate |
| D3 | Item | Item Category | Already captured |
| E3 | **Thickness** | Parent Coil → Thickness | **FROM SELECTED COIL** |
| F3 | **Width** | Parent Coil → Width | **FROM SELECTED COIL** |
| G3 | **Quantity** | Parent Coil → Available Weight | **FROM SELECTED COIL** |
| H3 | **No. of Meters** | **NEW - CALCULATED** | See formula below |

#### NEW FIELDS REQUIRED (Master Coil Section)

Add these fields at the top of "Planned Outputs" screen:

```
Parent Coil Details
├─ Coil No.: [Dropdown from selected coils]
├─ Thickness: [Read-only, from coil] (mm)
├─ Width: [Read-only, from coil] (mm)
├─ Available Weight: [Read-only, from coil] (MT)
└─ Total Length: [Auto-calculated, read-only] (meters)
```

**NEW CALCULATION: Total Length (Meters)**
```javascript
// Excel: H3 = =G3/E3/F3/7.85*1000
total_length_meters = (quantity_kg × 1000) / (thickness_mm × width_mm × 7.85)

// Example:
// quantity_kg = 12000
// thickness_mm = 0.8
// width_mm = 1250
// Result = (12000 × 1000) / (0.8 × 1250 × 7.85) = 1528 meters
```

---

#### Material/Output Configuration Section

**Excel Mapping: Rows 8-15 (Output Coil Details)**

Currently your UI shows:
- Material 1 (expandable)
  - Parent Coil (dropdown)
  - Target Width (mm) (dropdown)
  - No. of Coils (number)
  - Expected Weight (MT) (input)

#### FIELDS TO ADD/MODIFY:

**Current Structure:**
```
Material 1
├─ Parent Coil *
├─ Target Width (mm) *
├─ No. of Coils *
└─ Expected Weight (MT) *
```

**REQUIRED Structure:**
```
Material 1
├─ Parent Coil * [Dropdown]
├─ Customer Name [Text/Dropdown] ← ADD THIS
├─ Target Width (mm) * [Number input]
├─ No. of Slits * [Number input] ← ADD THIS
├─ Parts per Coil [Number input, default: 1] ← ADD THIS
├─ No. of Output Coils [Auto-calculated, read-only] ← MODIFY EXISTING
├─ Weight per Output Coil (MT) [Auto-calculated, read-only] ← ADD THIS
├─ Meters per Output Coil [Auto-calculated, read-only] ← ADD THIS
├─ Total Quantity (MT) [Auto-calculated, read-only] ← RENAME EXISTING
├─ Total Meters [Auto-calculated, read-only] ← ADD THIS
└─ Percentage [Auto-calculated, read-only] ← ADD THIS
```

#### CALCULATIONS FOR EACH MATERIAL/OUTPUT:

**1. Weight per Output Coil (MT)**
```javascript
// Excel: F8 = =IFERROR(($E$3*C8*$H$3*7.85/1000)/IF(E8=0,1,E8),0)

weight_per_coil_kg = (
    (thickness_mm × target_width_mm × total_length_meters × 7.85) / 1000
) / (parts_per_coil === 0 ? 1 : parts_per_coil)

weight_per_coil_MT = weight_per_coil_kg / 1000

// Explanation:
// 1. Calculate volume: thickness × width × length (in mm³)
// 2. Convert to weight: × 7.85 (density) ÷ 1000 = kg
// 3. Divide by parts per coil (default to 1 if 0)
// 4. Convert to MT

// Example:
// thickness = 0.8 mm
// target_width = 164 mm
// total_length = 1528 meters
// parts_per_coil = 2
// Result = ((0.8 × 164 × 1528 × 7.85) / 1000) / 2 = 788.5 kg = 0.789 MT
```

**2. Meters per Output Coil**
```javascript
// Excel: G8 = =IFERROR((F8)/(C8/1000)/($E$3)/(7.85),0)

meters_per_coil = weight_per_coil_kg / (target_width_mm / 1000) / thickness_mm / 7.85

// This is essentially reversing the weight calculation
// Alternative formula (more intuitive):
meters_per_coil = total_length_meters / (no_of_slits × parts_per_coil)

// Example:
// weight_per_coil = 788.5 kg
// target_width = 164 mm = 0.164 m
// thickness = 0.8 mm
// Result = 788.5 / 0.164 / 0.8 / 7.85 = 764 meters
```

**3. Number of Output Coils**
```javascript
// Excel: H8 = =IF(E8=0,D8,D8*E8)

no_of_output_coils = (parts_per_coil === 0) 
    ? no_of_slits 
    : no_of_slits × parts_per_coil

// Example:
// no_of_slits = 2
// parts_per_coil = 2
// Result = 2 × 2 = 4 coils
```

**4. Total Quantity (MT)**
```javascript
// Excel: I8 = =F8*H8

total_quantity_kg = weight_per_coil_kg × no_of_output_coils
total_quantity_MT = total_quantity_kg / 1000

// Example:
// weight_per_coil = 788.5 kg
// no_of_output_coils = 4
// Result = 788.5 × 4 = 3154 kg = 3.154 MT
```

**5. Total Meters**
```javascript
// Excel: J8 = =G8*H8

total_meters = meters_per_coil × no_of_output_coils

// Example:
// meters_per_coil = 764
// no_of_output_coils = 4
// Result = 764 × 4 = 3056 meters
```

**6. Percentage of Total**
```javascript
// Excel: K8 = =IFERROR(I8/$G$3,0)

percentage = (total_quantity_MT / parent_coil_available_MT) × 100

// Example:
// total_quantity = 3.154 MT
// parent_coil_available = 12 MT
// Result = (3.154 / 12) × 100 = 26.28%
```

---

#### Summary Section (Bottom of Material Card)

**Current Display:**
```
Total Output Width: 0
Wastage Width: 0
Wastage %: 0%
Utilization %: 0%
```

**CALCULATIONS:**

**1. Total Output Width**
```javascript
// Excel: I3 = =C8*D8+C9*D9+C10*D10+C11*D11+C12*D12+C13*D13+C14*D14+C15*D15

total_output_width = sum of (target_width × no_of_slits) for all materials

// Example:
// Material 1: 164mm × 2 = 328mm
// Material 2: 179mm × 2 = 358mm
// Material 3: 85mm × 2 = 170mm
// Material 4: 176mm × 2 = 352mm
// Total = 1208 mm
```

**2. Wastage Width**
```javascript
// Excel: J3 = =F3-I3

wastage_width_mm = parent_coil_width_mm - total_output_width_mm

// Example:
// parent_width = 1250 mm
// total_output_width = 1208 mm
// Result = 1250 - 1208 = 42 mm
```

**3. Wastage % (of Width)**
```javascript
wastage_percentage = (wastage_width_mm / parent_coil_width_mm) × 100

// Example:
// wastage_width = 42 mm
// parent_width = 1250 mm
// Result = (42 / 1250) × 100 = 3.36%
```

**4. Utilization %**
```javascript
utilization_percentage = 100 - wastage_percentage
// OR
utilization_percentage = (total_output_width_mm / parent_coil_width_mm) × 100

// Example:
// Result = 100 - 3.36 = 96.64%
```

---

#### Overall Summary Section

**Current Display:**
```
Total Expected Weight: 0.07 MT
Combined Wastage: 98.8%
Overall Utilization: 1.3%
```

**ISSUE IDENTIFIED:** The current "Combined Wastage: 98.8%" seems incorrect based on the visible data.

**CORRECT CALCULATIONS:**

**1. Total Expected Weight**
```javascript
// Excel: I16 = =SUM(I8:I15)

total_expected_weight_MT = sum of all material total_quantity_MT values

// Example:
// Material 1: 3.154 MT
// Material 2: 3.456 MT
// Material 3: 1.640 MT
// Material 4: 3.394 MT
// Total = 11.644 MT
```

**2. Combined Wastage (in MT)**
```javascript
// Calculate wastage weight
// Excel: F17 = =IFERROR(($E$3*C17*$H$3*7.85/1000),0)

wastage_weight_MT = (
    thickness_mm × wastage_width_mm × total_length_meters × 7.85 / 1000
) / 1000

// Example:
// thickness = 0.8 mm
// wastage_width = 42 mm
// total_length = 1528 meters
// Result = (0.8 × 42 × 1528 × 7.85 / 1000) / 1000 = 0.402 MT
```

**3. Combined Wastage %**
```javascript
// This should be percentage of material wasted

combined_wastage_percentage = (wastage_weight_MT / parent_coil_available_MT) × 100

// Example:
// wastage_weight = 0.402 MT
// parent_coil_available = 12 MT
// Result = (0.402 / 12) × 100 = 3.35%
```

**4. Overall Utilization %**
```javascript
overall_utilization = (total_expected_weight_MT / parent_coil_available_MT) × 100

// Example:
// total_expected_weight = 11.644 MT
// parent_coil_available = 12 MT
// Result = (11.644 / 12) × 100 = 97.03%
```

---

## CUTTING PROCESS

### Screen 4: Planned Outputs and Wastage - Cutting

#### Excel Mapping: Master Coil Section (Row 2-3)

**Excel Fields → ERP Fields:**

| Excel Cell | Excel Field | ERP Equivalent | Notes |
|------------|-------------|----------------|-------|
| E3 | Thickness | Parent Coil → Thickness | FROM SELECTED COIL |
| H3 | Width | Parent Coil → Width | FROM SELECTED COIL |
| K3 | Coating | Parent Coil → Coating | FROM SELECTED COIL |
| R5 | Total Coil Weight | Total of selected coils | NEW CALCULATION |

#### Current UI Shows:
```
Output No. | Source SFG | Target Length (mm) | Pieces/Packet | Packets | Total Pcs | Weight (MT)
```

#### REQUIRED Structure:
```
Material 1
├─ Source SFG * [Dropdown - selected coils]
├─ Customer/Order Name [Text] ← ADD THIS
├─ Target Length (mm) * [Number input]
├─ Sheets per Packet * [Number input] ← RENAME from "Pieces/Packet"
├─ Number of Packets * [Number input] ← RENAME from "Packets"
├─ Total Pieces [Auto-calculated] ← KEEP
├─ Packet Weight (MT) [Auto-calculated, read-only] ← ADD THIS
└─ Total Weight (MT) [Auto-calculated] ← KEEP
```

---

#### CALCULATIONS FOR EACH MATERIAL/OUTPUT:

**1. Packet Weight (MT)**
```javascript
// Excel: L8 = =IF(I8="","",(ROUND((((($E$3*$H$3*G8)/1000000)*7.85)*I8)/1000,2)))

if (sheets_per_packet === "" || sheets_per_packet === 0) {
    packet_weight_MT = ""
} else {
    // Step 1: Calculate area of one sheet in m²
    area_per_sheet_m2 = (thickness_mm × width_mm × length_mm) / 1000000
    
    // Step 2: Calculate weight of one sheet in kg
    weight_per_sheet_kg = area_per_sheet_m2 × 7.85
    
    // Step 3: Total weight for all sheets in packet
    total_weight_kg = weight_per_sheet_kg × sheets_per_packet
    
    // Step 4: Convert to MT
    packet_weight_MT = total_weight_kg / 1000
    
    // Step 5: Round to 2 decimals
    packet_weight_MT = round(packet_weight_MT, 2)
}

// Combined formula:
packet_weight_MT = round(
    (((thickness_mm × width_mm × length_mm) / 1000000) × 7.85 × sheets_per_packet) / 1000,
    2
)

// Example:
// thickness = 2 mm
// width = 1270 mm
// length = 2500 mm
// sheets = 100
// Step 1: area = (2 × 1270 × 2500) / 1000000 = 6.35 m²
// Step 2: weight_per_sheet = 6.35 × 7.85 = 49.85 kg
// Step 3: total = 49.85 × 100 = 4985 kg
// Step 4: MT = 4985 / 1000 = 4.985 MT
// Step 5: rounded = 4.99 MT
```

**2. Total Weight (MT)**
```javascript
// Excel: N8 = =IF(I8="","",(L8*K8))

if (sheets_per_packet === "" || sheets_per_packet === 0) {
    total_weight_MT = ""
} else {
    total_weight_MT = packet_weight_MT × number_of_packets
}

// Example:
// packet_weight = 4.99 MT
// number_of_packets = 2
// Result = 4.99 × 2 = 9.98 MT
```

**3. Total Pieces**
```javascript
total_pieces = sheets_per_packet × number_of_packets

// Example:
// sheets_per_packet = 100
// number_of_packets = 2
// Result = 100 × 2 = 200 pieces
```

---

#### Summary Section (Bottom of Material Card)

**ADD THESE FIELDS:**

```
Per Material Summary
├─ Total Pieces: [Sum of all outputs for this material]
├─ Total Length Required: [Sum of lengths needed] (mm)
├─ Head/Tail Scrap: [Calculated] (mm) ← NEW
├─ Wastage: [Calculated] (%)
└─ Utilization %: [Calculated] (%)
```

**CALCULATIONS:**

**1. Total Length Required**
```javascript
// This is straightforward
total_length_required_mm = target_length_mm × total_pieces

// Example:
// target_length = 2500 mm
// total_pieces = 200
// Result = 2500 × 200 = 500,000 mm = 500 meters
```

**2. Head/Tail Scrap**
```javascript
// Calculate available length from coil
available_length_meters = (
    source_coil_weight_kg × 1000
) / (thickness_mm × width_mm × 7.85)

available_length_mm = available_length_meters × 1000

// Scrap calculation
head_tail_scrap_mm = available_length_mm - total_length_required_mm

// If negative, it means not enough material
if (head_tail_scrap_mm < 0) {
    // Show error: insufficient material
}
```

**3. Wastage %**
```javascript
wastage_percentage = (head_tail_scrap_mm / available_length_mm) × 100
```

**4. Utilization %**
```javascript
utilization_percentage = (total_length_required_mm / available_length_mm) × 100
// OR
utilization_percentage = 100 - wastage_percentage
```

---

#### Overall Summary Section

**Current Display:**
```
Total Expected Weight: 0.07 MT
Combined Wastage: 1.3%
Overall Utilization: 98.8%
```

**CALCULATIONS:**

**1. Total Expected Weight**
```javascript
// Excel: (implied from N18)
total_expected_weight_MT = sum of all output total_weight_MT values

// Example from screenshot:
// CT-dk-row-1 from COIL-001: 3 × 40 × 40 = ?
// CT-dk-row-1 from COIL-002: 2 × 50 × 30 = ?
// Need to calculate using packet weight formula
```

**2. Total Input Weight**
```javascript
// Excel: R5 = =SUM(D5:M5)
total_input_weight_MT = sum of all selected source coil weights
```

**3. Expected Residual (BCR)**
```javascript
// Excel: R6 = =R5-N18
expected_residual_MT = total_input_weight_MT - total_expected_weight_MT

// This is the Balance Coil Remaining
```

**4. Combined Wastage**
```javascript
combined_wastage_MT = total_input_weight_MT - total_expected_weight_MT
combined_wastage_percentage = (combined_wastage_MT / total_input_weight_MT) × 100

// Example:
// total_input = 31.305 MT
// total_expected = 30.9 MT  
// combined_wastage = 0.405 MT
// Result = (0.405 / 31.305) × 100 = 1.29%
```

**5. Overall Utilization**
```javascript
overall_utilization = (total_expected_weight_MT / total_input_weight_MT) × 100
// OR
overall_utilization = 100 - combined_wastage_percentage

// Example:
// Result = (30.9 / 31.305) × 100 = 98.71%
```

---

## COMPLETE FORMULA REFERENCE

### Constants

```javascript
const STEEL_DENSITY = 7.85 // g/cm³ or kg/m³ × 1000
```

### Universal Calculations

**1. Coil Length from Weight**
```javascript
function calculateCoilLength(weight_kg, thickness_mm, width_mm) {
    // Returns length in meters
    return (weight_kg × 1000) / (thickness_mm × width_mm × STEEL_DENSITY)
}
```

**2. Weight from Dimensions**
```javascript
function calculateWeight(thickness_mm, width_mm, length_mm, quantity) {
    // Returns weight in kg
    const volume_mm3 = thickness_mm × width_mm × length_mm
    const weight_per_piece_kg = (volume_mm3 / 1000000) × STEEL_DENSITY
    return weight_per_piece_kg × quantity
}
```

**3. Meters from Weight**
```javascript
function calculateMeters(weight_kg, thickness_mm, width_mm) {
    // Returns length in meters
    return weight_kg / (width_mm / 1000) / thickness_mm / STEEL_DENSITY
}
```

---

## FIELD MAPPING & CHANGES

### Slitting Process - Fields to Add/Modify

#### Add to "Planned Outputs" Screen Header
```
☐ Parent Coil No. (Dropdown)
☐ Coil Thickness (Read-only, from coil)
☐ Coil Width (Read-only, from coil)
☐ Available Weight (Read-only, from coil)
☐ Total Length in Meters (Auto-calculated)
```

#### Modify "Material X" Section
```
☐ Add: Customer Name field
☐ Add: No. of Slits field
☐ Add: Parts per Coil field (default: 1)
☐ Rename: "No. of Coils" → "No. of Output Coils"
☐ Add: Weight per Output Coil (auto-calc)
☐ Add: Meters per Output Coil (auto-calc)
☐ Rename: "Expected Weight" → "Total Quantity (MT)"
☐ Add: Total Meters (auto-calc)
☐ Add: Percentage (auto-calc)
```

#### Material Summary Section
```
☑ Keep: Total Output Width
☑ Keep: Wastage Width
☑ Keep: Wastage %
☑ Keep: Utilization %
```

#### Overall Summary Section
```
☑ Keep: Total Expected Weight
☐ Fix: Combined Wastage calculation (currently showing incorrect %)
☑ Keep: Overall Utilization
```

---

### Cutting Process - Fields to Add/Modify

#### Add to Screen Header
```
☐ Parent Coil Details section showing:
  - Selected coil numbers
  - Thickness (from coil)
  - Width (from coil)
  - Total input weight
```

#### Modify "Material X" Section
```
☐ Add: Customer/Order Name field
☐ Rename: "Pieces/Packet" → "Sheets per Packet"
☐ Rename: "Packets" → "Number of Packets"
☐ Add: Packet Weight (MT) (auto-calc, read-only)
☑ Keep: Total Weight (MT)
☑ Keep: Total Pcs
```

#### Add Material Summary Section
```
☐ Total Pieces
☐ Total Length Required (mm)
☐ Head/Tail Scrap (mm)
☐ Wastage (%)
☐ Utilization (%)
```

#### Overall Summary Section
```
☑ Keep: Total Expected Weight
☐ Add: Total Input Weight
☐ Add: Expected Residual (BCR)
☑ Keep: Combined Wastage
☑ Keep: Overall Utilization
```

---

## VALIDATION RULES

### Input Validation

**1. Slitting Process**
```javascript
// Validation rules
- Target Width must be > 0
- Target Width must be < Parent Coil Width
- Sum of (Target Width × No. of Slits) must be ≤ Parent Coil Width
- No. of Slits must be > 0
- Parts per Coil must be ≥ 0 (0 treated as 1)
- Total Output Width + Wastage must equal Parent Coil Width
```

**2. Cutting Process**
```javascript
// Validation rules
- Target Length must be > 0
- Sheets per Packet must be > 0
- Number of Packets must be > 0
- Total Length Required must be ≤ Available Length from coil
- If Total Length > Available Length: Show error and suggest more coils
```

### Calculation Validation

**After all calculations, verify:**
```javascript
// Slitting
total_output_weight + wastage_weight ≈ parent_coil_weight (±0.5%)

// Cutting
total_expected_weight + residual_weight ≈ total_input_weight (±0.5%)

// If validation fails, flag for review
```

---

## UI CALCULATION FLOW

### Real-time Calculation Triggers

**Slitting - Calculate when:**
1. User selects Parent Coil → Auto-populate thickness, width, weight, calculate length
2. User enters Target Width → Validate against parent width
3. User enters No. of Slits → Calculate total output width
4. User enters Parts per Coil → Recalculate all output metrics
5. User clicks "+ Add Output" → Recalculate summary totals
6. Any field changes → Recalculate entire section

**Cutting - Calculate when:**
1. User selects Source Coil → Auto-populate specifications
2. User enters Target Length → Validate feasibility
3. User enters Sheets per Packet → Calculate packet weight
4. User enters Number of Packets → Calculate total weight
5. User clicks "+ Add Output" → Recalculate summary totals
6. Any field changes → Recalculate entire section

---

## ERROR HANDLING

### Display Error Messages

```javascript
// Insufficient material
if (total_length_required > available_length) {
    showError("Insufficient material. Required: ${total_length_required}mm, Available: ${available_length}mm")
}

// Exceeds parent width
if (total_output_width > parent_coil_width) {
    showError("Total output width (${total_output_width}mm) exceeds coil width (${parent_coil_width}mm)")
}

// Division by zero protection
if (value === 0) {
    return 0 // Or show warning
}

// Invalid calculations
if (isNaN(calculated_value) || !isFinite(calculated_value)) {
    return 0
    logError("Invalid calculation in field XYZ")
}
```

---

## TESTING CHECKLIST

### Test Cases - Slitting

**Test 1: Basic Slitting**
```
Input:
- Parent Coil: Thickness 0.8mm, Width 1250mm, Weight 12MT
- Output 1: Width 164mm, 2 slits, 2 parts
Expected:
- Total Length: ~1528 meters
- Weight per coil: ~0.789 MT
- No. of output coils: 4
- Total quantity: ~3.156 MT
- Wastage width: 922mm (if only one output)
```

**Test 2: Multiple Outputs**
```
Input:
- Parent Coil: Thickness 0.8mm, Width 1250mm, Weight 12MT
- Output 1: Width 164mm, 2 slits, 2 parts
- Output 2: Width 179mm, 2 slits, 2 parts
- Output 3: Width 85mm, 2 slits, 2 parts
- Output 4: Width 176mm, 2 slits, 2 parts
Expected:
- Total output width: 1208mm
- Wastage width: 42mm
- Wastage %: ~3.36%
- Utilization %: ~96.64%
```

**Test 3: Zero Parts per Coil**
```
Input:
- Parts per Coil: 0
Expected:
- Should treat as 1 (not cause division error)
- No. of output coils = No. of slits
```

### Test Cases - Cutting

**Test 1: Basic Cutting**
```
Input:
- Source Coil: Thickness 2mm, Width 1270mm, Weight 10MT
- Output 1: Length 2500mm, 100 sheets, 2 packets
Expected:
- Packet weight: ~4.99 MT
- Total weight: ~9.98 MT
- Residual: ~0.02 MT
```

**Test 2: Multiple Orders**
```
Input:
- Source Coils: Total 31.305 MT
- Multiple outputs with varying lengths and quantities
Expected:
- Total expected weight: Sum of all outputs
- BCR: Input - Expected
- Utilization: ~98-99%
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: Critical Calculations (Must Have)
1. ✅ Total Length from Weight
2. ✅ Weight per Output Coil (Slitting)
3. ✅ Packet Weight (Cutting)
4. ✅ Wastage Width calculation
5. ✅ Total Weight calculations

### Phase 2: Enhanced Features (Should Have)
1. ⬜ Meters per Coil display
2. ⬜ Percentage of total
3. ⬜ Head/Tail scrap calculation
4. ⬜ Customer name per output

### Phase 3: Optimization (Nice to Have)
1. ⬜ Real-time validation messages
2. ⬜ Optimal coil suggestion based on wastage
3. ⬜ Historical wastage analysis
4. ⬜ Multiple parent coil support

---

## APPENDIX A: Formula Quick Reference Card

### Slitting Formulas
```javascript
// Length from weight
L = (W × 1000) / (T × Width × 7.85)

// Weight per coil
Wc = ((T × Width × L × 7.85) / 1000) / Parts

// Output coils
N = Slits × Parts (or Slits if Parts=0)

// Total weight
Wt = Wc × N

// Wastage
Ww = Parent_Width - Σ(Width × Slits)
```

### Cutting Formulas
```javascript
// Packet weight
Wp = (((T × Width × L) / 1000000) × 7.85 × Sheets) / 1000

// Total weight
Wt = Wp × Packets

// Residual
BCR = Input_Weight - Total_Output_Weight
```

---

## APPENDIX B: Excel vs ERP Field Mapping Table

### Slitting Plan Excel → ERP

| Excel | Cell | Field | ERP Equivalent | Status |
|-------|------|-------|----------------|--------|
| Row 3 | E3 | Thickness | Parent Coil → Thickness | ✅ Exists |
| Row 3 | F3 | Width | Parent Coil → Width | ✅ Exists |
| Row 3 | G3 | Quantity | Available Weight | ✅ Exists |
| Row 3 | H3 | No. of Meters | **Total Length** | ⬜ ADD |
| Row 8+ | B | Customer Name | **Customer Name** | ⬜ ADD |
| Row 8+ | C | Width | Target Width | ✅ Exists |
| Row 8+ | D | No. of Slits | **No. of Slits** | ⬜ ADD |
| Row 8+ | E | Parts per Coil | **Parts per Coil** | ⬜ ADD |
| Row 8+ | F | Weight per Coil | **Weight per Output Coil** | ⬜ ADD |
| Row 8+ | G | Meters per Coil | **Meters per Output Coil** | ⬜ ADD |
| Row 8+ | H | Output Coils | No. of Output Coils | ✅ Exists (rename) |
| Row 8+ | I | Total Qty | Total Quantity (MT) | ✅ Exists (rename) |
| Row 8+ | J | Total Meters | **Total Meters** | ⬜ ADD |
| Row 8+ | K | Percentage | **Percentage** | ⬜ ADD |

### Cutting Request Excel → ERP

| Excel | Cell | Field | ERP Equivalent | Status |
|-------|------|-------|----------------|--------|
| Row 3 | E3 | Thickness | Source Coil → Thickness | ✅ Exists |
| Row 3 | H3 | Width | Source Coil → Width | ✅ Exists |
| Row 8+ | A | Customer | **Customer/Order Name** | ⬜ ADD |
| Row 8+ | G | Length | Target Length | ✅ Exists |
| Row 8+ | I | Sheets | Sheets per Packet | ✅ Exists (rename) |
| Row 8+ | K | Packets | Number of Packets | ✅ Exists (rename) |
| Row 8+ | L | Packet Weight | **Packet Weight (MT)** | ⬜ ADD |
| Row 8+ | N | Total Weight | Total Weight (MT) | ✅ Exists |
| Row 5 | R5 | Total Coil Wt | **Total Input Weight** | ⬜ ADD |
| Row 6 | R6 | BCR Coil Wt | **Expected Residual** | ⬜ ADD |

---

## DOCUMENT CONTROL

**Version History:**
- v1.0 - Initial release - February 16, 2026

**Review Status:**
- [ ] Development Team Review
- [ ] QA Team Review
- [ ] Business User Review
- [ ] Final Approval

**Contact:**
For questions or clarifications about this specification, contact the product team.

---

**END OF DEVELOPER HANDOFF DOCUMENT**