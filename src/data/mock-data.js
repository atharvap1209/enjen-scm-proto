// Mock Data — Manufacturing ERP Prototype
// Units: Weight in MT, thickness/width in mm, length in meters

export const CUSTOMERS = ['JSW Steel Ltd', 'Tata Steel', 'SAIL', 'Jindal Steel', 'Essar Steel', 'Meenakshi Steel', 'ABC Steel Ltd'];
export const ITEM_CATEGORIES = ['Coil', 'Sheet', 'Slit Coil', 'Strip'];
export const ITEM_TYPES = ['HR Coil', 'CR Coil', 'GP Coil', 'GI Sheet', 'HR Sheet', 'CR Sheet', 'Slit Strip', 'Cut Sheet', 'Blank'];
export const GRADES = ['ASTM A653', 'CRCA', 'HRPO', 'IS 2062', 'SAE 1008'];
export const COATINGS = ['120 GSM', '150 GSM', '180 GSM', 'Galvanized', 'None'];
export const SURFACES = ['Skinpass', 'Matte', 'Bright', 'Regular'];
export const LINES = ['Slitting Line A', 'Slitting Line B', 'Cutting Line A', 'Cutting Line B'];
export const MACHINES = ['SLT-01', 'SLT-02', 'CUT-01', 'CUT-02'];
export const BANK_ACCOUNTS = [
    { id: 'BANK-01', name: 'HDFC Bank - Main', accNo: '50200012345678', ifsc: 'HDFC0001234', branch: 'Mumbai Central' },
    { id: 'BANK-02', name: 'ICICI Bank - Ops', accNo: '001105009988', ifsc: 'ICIC0000011', branch: 'Pune Bypass' },
    { id: 'BANK-03', name: 'SBI - Export', accNo: '33445566778', ifsc: 'SBIN0004567', branch: 'Delhi Corporate' }
];

// WO columns per PRD: WO number, status, priority, customer name, coil utilization%, leftover%, start date, due date
export const WORK_ORDERS = [
    {
        id: 'WO-2024-001', customers: ['JSW Steel Ltd'], operationType: 'Slitting',
        dueDate: '17-11-2025', startDate: '10-11-2025', priority: 'High',
        progress: 75, coilUtilization: 92, leftoverPct: 8,
        status: 'Pending', createdBy: 'John Smith',
        category: 'Slit Coil', grade: 'CRCA',
        thicknessMin: 1.5, thicknessMax: 2.5, widthMin: 1000, widthMax: 1200,
        coating: '120 GSM', surfaceFinish: 'Matte', quantityDemand: 50,
        coils: ['COIL-001'],
        slittingOutputs: [
            { partName: 'Part A', coilNumber: 'COIL-001', width: 300, numCoils: 2, weightMT: 12.3, leftoverPct: 12 },
            { partName: 'Part B', coilNumber: 'COIL-001', width: 400, numCoils: 1, weightMT: 8.2, leftoverPct: 8 },
        ],
        cuttingOutputs: [],
        line: 'Slitting Line A', machine: 'SLT-01',
    },
    {
        id: 'WO-2024-002', customers: ['Tata Steel'], operationType: 'Cutting',
        dueDate: '20-11-2025', startDate: '12-11-2025', priority: 'Medium',
        progress: 100, coilUtilization: 95, leftoverPct: 5,
        status: 'Completed', createdBy: 'Sarah Johnson',
        category: 'Sheet', grade: 'ASTM A653',
        thicknessMin: 2, thicknessMax: 3, widthMin: 1200, widthMax: 1250,
        coating: '150 GSM', surfaceFinish: 'Skinpass', quantityDemand: 30,
        coils: ['COIL-002'],
        slittingOutputs: [],
        cuttingOutputs: [
            { partName: 'Part C', coilNumber: 'COIL-002', length: 2.5, numPieces: 100, weightMT: 30, leftoverPct: 20 },
            { partName: 'Part D', coilNumber: 'COIL-002', length: 1.8, numPieces: 200, weightMT: 42, leftoverPct: 5 },
        ],
        line: 'Cutting Line A', machine: 'CUT-01',
    },
    {
        id: 'WO-2024-003', customers: ['SAIL'], operationType: 'Slitting',
        dueDate: '25-11-2025', startDate: '15-11-2025', priority: 'Low',
        progress: 45, coilUtilization: 88, leftoverPct: 12,
        status: 'On Hold', createdBy: 'Mike Chen',
        category: 'Coil', grade: 'HRPO',
        thicknessMin: 1.5, thicknessMax: 2, widthMin: 1000, widthMax: 1300,
        coating: 'None', surfaceFinish: 'Regular', quantityDemand: 40,
        coils: ['COIL-003'],
        slittingOutputs: [
            { partName: 'Part A', coilNumber: 'COIL-003', width: 500, numCoils: 2, weightMT: 15, leftoverPct: 12 },
        ],
        cuttingOutputs: [],
        line: 'Slitting Line B', machine: 'SLT-02',
    },
    {
        id: 'WO-2024-004', customers: ['Jindal Steel'], operationType: 'Slitting',
        dueDate: '15-11-2025', startDate: '08-11-2025', priority: 'High',
        progress: 60, coilUtilization: 85, leftoverPct: 18,
        status: 'Delayed', createdBy: 'Emily Davis',
        category: 'Slit Coil', grade: 'IS 2062',
        thicknessMin: 1, thicknessMax: 1.5, widthMin: 1200, widthMax: 1400,
        coating: '120 GSM', surfaceFinish: 'Matte', quantityDemand: 60,
        coils: ['COIL-001', 'COIL-002'],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Slitting Line A', machine: 'SLT-01',
    },
    {
        id: 'WO-2024-005', customers: ['Essar Steel'], operationType: 'Cutting',
        dueDate: '14-11-2025', startDate: '06-11-2025', priority: 'Medium',
        progress: 70, coilUtilization: 90, leftoverPct: 10,
        status: 'Delayed', createdBy: 'Robert Wilson',
        category: 'Sheet', grade: 'SAE 1008',
        thicknessMin: 3, thicknessMax: 4, widthMin: 1400, widthMax: 1500,
        coating: '180 GSM', surfaceFinish: 'Bright', quantityDemand: 20,
        coils: ['COIL-003'],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Cutting Line B', machine: 'CUT-02',
    },
    {
        id: 'WO-2024-006', customers: ['Essar Steel'], operationType: 'Cutting',
        dueDate: '22-11-2025', startDate: '13-11-2025', priority: 'Low',
        progress: 30, coilUtilization: 82, leftoverPct: 15,
        status: 'On Hold', createdBy: 'Lisa Anderson',
        category: 'Sheet', grade: 'CRCA',
        thicknessMin: 1, thicknessMax: 1.5, widthMin: 1000, widthMax: 1100,
        coating: 'Galvanized', surfaceFinish: 'Regular', quantityDemand: 35,
        coils: ['COIL-001'],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Cutting Line A', machine: 'CUT-01',
    },
    {
        id: 'WO-2024-007', customers: ['SAIL'], operationType: 'Slitting',
        dueDate: '10-11-2025', startDate: '01-11-2025', priority: 'High',
        progress: 100, coilUtilization: 96, leftoverPct: 4,
        status: 'Completed', createdBy: 'David Brown',
        category: 'Slit Coil', grade: 'ASTM A653',
        thicknessMin: 0.8, thicknessMax: 1, widthMin: 1200, widthMax: 1300,
        coating: '150 GSM', surfaceFinish: 'Skinpass', quantityDemand: 50,
        coils: ['COIL-002'],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Slitting Line A', machine: 'SLT-01',
    },
    {
        id: 'WO-2024-008', customers: ['JSW Steel Ltd'], operationType: 'Cutting',
        dueDate: '28-11-2025', startDate: '20-11-2025', priority: 'Medium',
        progress: 55, coilUtilization: 91, leftoverPct: 9,
        status: 'In Progress', createdBy: 'Jennifer Lee',
        category: 'Sheet', grade: 'HRPO',
        thicknessMin: 2.5, thicknessMax: 3.5, widthMin: 1100, widthMax: 1250,
        coating: '120 GSM', surfaceFinish: 'Matte', quantityDemand: 45,
        coils: ['COIL-003'],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Cutting Line B', machine: 'CUT-01',
    },
    {
        id: 'WO-2024-009', customers: ['JSW Steel Ltd', 'Tata Steel'], operationType: 'Slitting',
        dueDate: '05-11-2025', startDate: '28-10-2025', priority: 'Low',
        progress: 100, coilUtilization: 94, leftoverPct: 6,
        status: 'Completed', createdBy: 'Michael Zhang',
        category: 'Slit Coil', grade: 'IS 2062',
        thicknessMin: 1, thicknessMax: 1.5, widthMin: 1250, widthMax: 1350,
        coating: '180 GSM', surfaceFinish: 'Bright', quantityDemand: 30,
        coils: ['COIL-001'],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Slitting Line B', machine: 'SLT-02',
    },
    {
        id: 'WO-2024-010', customers: ['Tata Steel'], operationType: 'Slitting',
        dueDate: '30-11-2025', startDate: '--', priority: 'High',
        progress: 0, coilUtilization: 0, leftoverPct: 0,
        status: 'Pending', createdBy: 'Amanda White',
        category: 'Slit Coil', grade: 'SAE 1008',
        thicknessMin: 0.8, thicknessMax: 1.2, widthMin: 1200, widthMax: 1300,
        coating: '120 GSM', surfaceFinish: 'Skinpass', quantityDemand: 55,
        coils: [],
        slittingOutputs: [],
        cuttingOutputs: [],
        line: 'Slitting Line A', machine: 'SLT-01',
    },
];

// Coils: thickness 1-5mm, width 1000-1500mm, weight in MT
// Listing columns per PRD: Coil No, Category, Grade, Thickness, Width, Surface, Current Weight, Aging
export const COILS = [
    {
        id: 'COIL-001', category: 'Coil', grade: 'ASTM A653',
        thicknessMm: 2.5, widthMm: 1200, surface: 'Skinpass', coating: '120 GSM',
        currentWeightMT: 50, availableKg: 50000, aging: '40 days', supplier: 'JSW Steel Ltd',
    },
    {
        id: 'COIL-002', category: 'Coil', grade: 'CRCA',
        thicknessMm: 1.5, widthMm: 1000, surface: 'Matte', coating: '150 GSM',
        currentWeightMT: 35, availableKg: 35000, aging: '10 days', supplier: 'Tata Steel',
    },
    {
        id: 'COIL-003', category: 'Coil', grade: 'HRPO',
        thicknessMm: 3.0, widthMm: 1500, surface: 'Regular', coating: '180 GSM',
        currentWeightMT: 60, availableKg: 60000, aging: '3 days', supplier: 'SAIL',
    },
    {
        id: 'COIL-004', category: 'Coil', grade: 'IS 2062',
        thicknessMm: 4.5, widthMm: 1250, surface: 'Skinpass', coating: 'Galvanized',
        currentWeightMT: 45, availableKg: 45000, aging: '25 days', supplier: 'Jindal Steel',
    },
    {
        id: 'COIL-005', category: 'Coil', grade: 'SAE 1008',
        thicknessMm: 1.0, widthMm: 1350, surface: 'Bright', coating: 'None',
        currentWeightMT: 28, availableKg: 28000, aging: '7 days', supplier: 'Essar Steel',
    },
];

// Production process stages — one per WO operation
export const PRODUCTION_STAGES = [
    { id: 'STG-2024-001', woNumber: 'WO-2024-001', stageName: 'Slitting Stage 1', operationType: 'Slitting', machine: 'SLT-01', line: 'Slitting Line A', customer: 'JSW Steel Ltd', progress: 75, status: 'Pending', priority: 'High', startTime: '20-11-2025 08:00', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-002', woNumber: 'WO-2024-002', stageName: 'Cutting Stage 1', operationType: 'Cutting', machine: 'CUT-01', line: 'Cutting Line A', customer: 'Tata Steel', progress: 100, status: 'Completed', priority: 'Medium', startTime: '18-11-2025 09:00', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-003', woNumber: 'WO-2024-003', stageName: 'Slitting Stage 1', operationType: 'Slitting', machine: 'SLT-01', line: 'Slitting Line B', customer: 'SAIL', progress: 45, status: 'On Hold', priority: 'Low', startTime: '19-11-2025 07:30', pauseTime: '20-11-2025 10:00', resumeTime: '--' },
    { id: 'STG-2024-004', woNumber: 'WO-2024-004', stageName: 'Slitting Stage 1', operationType: 'Slitting', machine: 'SLT-01', line: 'Slitting Line A', customer: 'Jindal Steel', progress: 60, status: 'Delayed', priority: 'High', startTime: '17-11-2025 06:00', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-005', woNumber: 'WO-2024-005', stageName: 'Cutting Stage 1', operationType: 'Cutting', machine: 'CUT-01', line: 'Cutting Line B', customer: 'Essar Steel', progress: 70, status: 'Delayed', priority: 'Medium', startTime: '16-11-2025 08:00', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-006', woNumber: 'WO-2024-006', stageName: 'Cutting Stage 1', operationType: 'Cutting', machine: 'CUT-01', line: 'Cutting Line A', customer: 'Essar Steel', progress: 30, status: 'On Hold', priority: 'Low', startTime: '15-11-2025 09:30', pauseTime: '16-11-2025 14:00', resumeTime: '--' },
    { id: 'STG-2024-007', woNumber: 'WO-2024-007', stageName: 'Slitting Stage 1', operationType: 'Slitting', machine: 'SLT-01', line: 'Slitting Line A', customer: 'SAIL', progress: 100, status: 'Completed', priority: 'High', startTime: '14-11-2025 07:00', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-008', woNumber: 'WO-2024-008', stageName: 'Cutting Stage 1', operationType: 'Cutting', machine: 'CUT-01', line: 'Cutting Line B', customer: 'JSW Steel Ltd', progress: 55, status: 'In Progress', priority: 'Medium', startTime: '20-11-2025 10:00', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-009', woNumber: 'WO-2024-009', stageName: 'Slitting Stage 1', operationType: 'Slitting', machine: 'SLT-01', line: 'Slitting Line B', customer: 'JSW Steel Ltd', progress: 100, status: 'Completed', priority: 'Low', startTime: '13-11-2025 06:30', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-010', woNumber: 'WO-2024-010', stageName: 'Slitting Stage 1', operationType: 'Slitting', machine: 'SLT-01', line: 'Slitting Line A', customer: 'Tata Steel', progress: 0, status: 'Pending', priority: 'High', startTime: '--', pauseTime: '--', resumeTime: '--' },
    { id: 'STG-2024-011', woNumber: 'WO-2024-011', stageName: 'Slitting + Cutting Stage 1', operationType: 'Slitting+Cutting', machine: 'SLT-01', line: 'Slitting Line A', customer: 'Meenakshi Steel', progress: 40, status: 'In Progress', priority: 'High', startTime: '24-02-2026 08:00', pauseTime: '--', resumeTime: '--' },
];

// Steel density in g/cm³
export const STEEL_DENSITY = 7.85;

// Calculate coil length in meters given weight(MT), thickness(mm), width(mm)
export function calcCoilLengthM(weightMT, thicknessMm, widthMm) {
    const weightKg = weightMT * 1000;
    // length(m) = weight(kg) / (thickness(m) * width(m) * density(kg/m³))
    const thicknessM = thicknessMm / 1000;
    const widthM = widthMm / 1000;
    return weightKg / (thicknessM * widthM * STEEL_DENSITY * 1000);
}

// Calculate weight in MT from thickness(mm), width(mm), length(m), quantity
export function calcWeightMT(thicknessMm, widthMm, lengthM, qty = 1) {
    const thicknessM = thicknessMm / 1000;
    const widthM = widthMm / 1000;
    const volumeM3 = thicknessM * widthM * lengthM;
    const weightKg = volumeM3 * STEEL_DENSITY * 1000;
    return (weightKg * qty) / 1000; // MT
}

// Leftover % = (input - output) / input * 100
export function calcLeftoverPct(total, used) {
    if (!total || total === 0) return 0;
    return Math.max(0, ((total - used) / total) * 100);
}

// Invoices Mock Data
export const INVOICES = [
    { id: 'INV-2024-1001', date: '21-11-2025', dueDate: '21-12-2025', orderNo: 'SO-1044', customer: 'JSW Steel Ltd', status: 'Issued', value: 1250000 },
    { id: 'INV-2024-1002', date: '22-11-2025', dueDate: '22-12-2025', orderNo: 'Manual', customer: 'Tata Steel', status: 'Draft', value: 450000 },
    { id: 'INV-2024-1003', date: '15-11-2025', dueDate: '15-12-2025', orderNo: 'SO-1011', customer: 'SAIL', status: 'Paid', value: 2100000 },
    { id: 'INV-2024-1004', date: '20-11-2025', dueDate: '20-12-2025', orderNo: 'SO-1088', customer: 'Essar Steel', status: 'Issued', value: 890000 },
];


// ─── Shipment Module Mock Data ─────────────────────────────────────────────

export const AVAILABLE_INVOICES = [
    {
        id: 'INV-2025-001', orderNo: 'SO-1044', customer: 'JSW Steel Ltd',
        value: 1250000, date: '20-02-2026',
        shippingAddress: 'Plot 45, MIDC Nagpur, Maharashtra - 440018',
        lineItems: [
            { partName: 'Slit Coil 2mm CRCA', numPieces: 5, unitPrice: 58000, unitWeightMT: 1.0, totalWeightMT: 5.0 },
            { partName: 'Cut Sheet 4ft HR', numPieces: 10, unitPrice: 24500, unitWeightMT: 0.25, totalWeightMT: 2.5 },
        ]
    },
    {
        id: 'INV-2025-002', orderNo: 'SO-1058', customer: 'Tata Steel',
        value: 875000, date: '19-02-2026',
        shippingAddress: 'Sector 7, Industrial Area, Pune - 411057',
        lineItems: [
            { partName: 'HR Coil 3mm IS2062', numPieces: 8, unitPrice: 52000, unitWeightMT: 1.2, totalWeightMT: 9.6 },
        ]
    },
    {
        id: 'INV-2025-003', orderNo: 'SO-1061', customer: 'SAIL',
        value: 2100000, date: '18-02-2026',
        shippingAddress: 'G-12, Bhilai Steel Complex, Chhattisgarh - 490001',
        lineItems: [
            { partName: 'GP Coil 150 GSM', numPieces: 12, unitPrice: 48000, unitWeightMT: 0.9, totalWeightMT: 10.8 },
            { partName: 'Slit Strip 1.5mm', numPieces: 6, unitPrice: 41000, unitWeightMT: 0.5, totalWeightMT: 3.0 },
        ]
    },
    {
        id: 'INV-2025-004', orderNo: 'SO-1072', customer: 'Jindal Steel',
        value: 680000, date: '17-02-2026',
        shippingAddress: 'Plot 12, Hisar Industrial Park, Haryana - 125005',
        lineItems: [
            { partName: 'CR Sheet HRPO 2.5mm', numPieces: 20, unitPrice: 33000, unitWeightMT: 0.18, totalWeightMT: 3.6 },
        ]
    },
    {
        id: 'INV-2025-005', orderNo: 'SO-1085', customer: 'Essar Steel',
        value: 945000, date: '16-02-2026',
        shippingAddress: 'Hazira Manufacturing Division, Surat - 394270',
        lineItems: [
            { partName: 'GI Sheet 180 GSM', numPieces: 15, unitPrice: 36000, unitWeightMT: 0.35, totalWeightMT: 5.25 },
            { partName: 'Blank CRCA 1mm', numPieces: 30, unitPrice: 11500, unitWeightMT: 0.12, totalWeightMT: 3.6 },
        ]
    },
];

export const VEHICLES = [
    { id: 'VH-01', plate: 'MH-17-AB-1234', type: 'Truck 20T', available: true },
    { id: 'VH-02', plate: 'MH-04-CD-5678', type: 'Truck 10T', available: true },
    { id: 'VH-03', plate: 'MH-12-EF-9012', type: 'Truck 20T', available: false, reason: 'Maintenance' },
    { id: 'VH-04', plate: 'MH-09-GH-3456', type: 'Mini Truck 5T', available: true },
];

export const DRIVERS = [
    { id: 'DR-01', name: 'Rajesh Ramesh', phone: '9876543210', available: true },
    { id: 'DR-02', name: 'Suresh Patil', phone: '9765432109', available: true },
    { id: 'DR-03', name: 'Mukesh Sharma', phone: '9654321098', available: false, reason: 'On Leave' },
    { id: 'DR-04', name: 'Dinesh Kumar', phone: '9543210987', available: true },
];

export let SHIPMENTS = [
    {
        id: 'SH-2026-0001', date: '21-02-2026',
        invoiceIds: ['INV-2025-001', 'INV-2025-002'],
        customer: 'JSW Steel Ltd', destination: 'Nagpur, MH',
        transportMode: 'Internal Fleet', vehiclePlate: 'MH-17-AB-1234',
        driverName: 'Rajesh Ramesh', ewayBill: '181234567890', pickupDate: '22-02-2026',
        netWeightMT: 17.1, grossWeightMT: 26.9,
        status: 'Ready to Ship', priority: 'High',
        timeline: [
            { event: 'Shipment Created', date: '21-02-2026 09:30', by: 'Priya M', done: true },
            { event: 'Vehicle Dispatched', date: null, by: null, done: false },
            { event: 'In Transit', date: null, by: null, done: false },
            { event: 'Delivered', date: null, by: null, done: false },
        ]
    },
    {
        id: 'SH-2026-0002', date: '20-02-2026',
        invoiceIds: ['INV-2025-003'],
        customer: 'SAIL', destination: 'Bhilai, CG',
        transportMode: 'External Carrier', vehiclePlate: 'CG-07-XY-2233',
        driverName: 'Arun Singh', carrierName: 'FastMove Logistics',
        ewayBill: '990011223344', pickupDate: '20-02-2026',
        netWeightMT: 13.8, grossWeightMT: null,
        status: 'In Transit', priority: 'Normal',
        timeline: [
            { event: 'Shipment Created', date: '20-02-2026 08:00', by: 'Ravi K', done: true },
            { event: 'Vehicle Dispatched', date: '20-02-2026 10:15', by: 'Ravi K', done: true },
            { event: 'In Transit', date: '20-02-2026 10:30', by: 'System', done: true },
            { event: 'Delivered', date: null, by: null, done: false },
        ]
    },
    {
        id: 'SH-2026-0003', date: '19-02-2026',
        invoiceIds: ['INV-2025-004'],
        customer: 'Jindal Steel', destination: 'Hisar, HR',
        transportMode: 'Internal Fleet', vehiclePlate: 'MH-04-CD-5678',
        driverName: 'Suresh Patil', ewayBill: '556677889900', pickupDate: '19-02-2026',
        netWeightMT: 3.6, grossWeightMT: 9.6,
        status: 'Delivered', priority: 'High',
        timeline: [
            { event: 'Shipment Created', date: '19-02-2026 07:00', by: 'Priya M', done: true },
            { event: 'Vehicle Dispatched', date: '19-02-2026 09:00', by: 'Priya M', done: true },
            { event: 'In Transit', date: '19-02-2026 09:20', by: 'System', done: true },
            { event: 'Delivered', date: '19-02-2026 16:45', by: 'System', done: true },
        ]
    },
    {
        id: 'SH-2026-0004', date: '18-02-2026',
        invoiceIds: ['INV-2025-005'],
        customer: 'Essar Steel', destination: 'Surat, GJ',
        transportMode: 'Internal Fleet', vehiclePlate: 'MH-09-GH-3456',
        driverName: 'Dinesh Kumar', ewayBill: '112233445566', pickupDate: '18-02-2026',
        netWeightMT: 8.85, grossWeightMT: null,
        status: 'Cancelled', priority: 'Normal',
        cancelReason: 'Vehicle breakdown on route. Rescheduling required.',
        timeline: [
            { event: 'Shipment Created', date: '18-02-2026 08:30', by: 'Ravi K', done: true },
            { event: 'Cancelled', date: '18-02-2026 11:00', by: 'Ravi K', done: true },
        ]
    },
    {
        id: 'SH-2026-0005', date: '23-02-2026',
        invoiceIds: ['INV-2025-002'],
        customer: 'Tata Steel', destination: 'Pune, MH',
        transportMode: null, vehiclePlate: null,
        driverName: null, ewayBill: null, pickupDate: null,
        netWeightMT: 9.6, grossWeightMT: null,
        status: 'Draft', priority: 'Normal',
        timeline: [
            { event: 'Draft Saved', date: '23-02-2026 01:30', by: 'Priya M', done: true },
        ]
    },
];

export function addShipment(shipment) {
    SHIPMENTS.unshift(shipment);
}

// ─── Supplier Portal Mock Data ──────────────────────────────────────────────

export let SUPPLIER_RFQS = [
    {
        rfqNumber: 'RFQ-2026-0041',
        issueDate: '20-02-2026',
        dueDate: '28-02-2026',
        approxValue: 875000,
        specialInstructions: 'All items must conform to IS 2062 grade. Delivery to Nagpur warehouse. Include certificate of conformance with each lot.',
        status: 'Selected',
        paymentTerms: 'Net 45 days',
        lineItems: [
            {
                itemCode: 'ITEM-HR-001',
                description: 'HR Coil 3mm IS2062 — Width 1200mm',
                quantity: 8,
                uom: 'MT',
                attachments: ['Drawing_HR001.pdf', 'Spec_IS2062.pdf'],
            },
            {
                itemCode: 'ITEM-CRS-002',
                description: 'CR Sheet HRPO 2.5mm — 1250 x 2500mm',
                quantity: 20,
                uom: 'Nos',
                attachments: ['Spec_HRPO.pdf'],
            },
            {
                itemCode: 'ITEM-GI-003',
                description: 'GI Sheet 120 GSM — 1000 x 2000mm',
                quantity: 35,
                uom: 'Nos',
                attachments: [],
            },
        ],
        submittedQuote: {
            lineItems: {
                'ITEM-HR-001': { itemPrice: 58000, leadTimeDays: 7, discountPct: 1.5, priceValidityDate: '2026-03-10', deliveryDate: '2026-03-20', notes: '' },
                'ITEM-CRS-002': { itemPrice: 4200, leadTimeDays: 5, discountPct: 0, priceValidityDate: '2026-03-10', deliveryDate: '2026-03-15', notes: '' },
                'ITEM-GI-003': { itemPrice: 3800, leadTimeDays: 10, discountPct: 0, priceValidityDate: '2026-03-10', deliveryDate: '2026-03-25', notes: '' }
            },
            shippingCost: 8500,
            taxPct: 18,
            termsAndConditions: 'Priority delivery confirmed for Nagpur warehouse.'
        }
    },
    {
        rfqNumber: 'RFQ-2026-0038',
        issueDate: '15-02-2026',
        dueDate: '25-02-2026',
        approxValue: 540000,
        specialInstructions: 'Preferred supplier packaging: PP bands + stretch wrap. Label each bundle with heat number.',
        status: 'Open',
        paymentTerms: 'Net 30 days',
        lineItems: [
            {
                itemCode: 'ITEM-SLT-010',
                description: 'Slit Coil CRCA 1.5mm — Width 600mm',
                quantity: 15,
                uom: 'MT',
                attachments: ['RFQ_38_Drawing.pdf'],
            },
            {
                itemCode: 'ITEM-SLT-011',
                description: 'Slit Coil CRCA 1.5mm — Width 800mm',
                quantity: 10,
                uom: 'MT',
                attachments: [],
            },
        ],
    },
    {
        rfqNumber: 'RFQ-2026-0031',
        issueDate: '08-02-2026',
        dueDate: '18-02-2026',
        approxValue: 1250000,
        specialInstructions: 'Urgent order. Delivery within 10 days of PO. Mill test reports mandatory.',
        status: 'Quote Submitted',
        paymentTerms: 'Advance 30%, Net 60 days',
        lineItems: [
            {
                itemCode: 'ITEM-GP-020',
                description: 'GP Coil 150 GSM — Width 1000mm',
                quantity: 25,
                uom: 'MT',
                attachments: ['GP_Spec.pdf'],
            },
            {
                itemCode: 'ITEM-GP-021',
                description: 'GP Coil 180 GSM — Width 1200mm',
                quantity: 18,
                uom: 'MT',
                attachments: [],
            },
        ],
        submittedQuote: {
            lineItems: {
                'ITEM-GP-020': {
                    itemPrice: 52000,
                    leadTimeDays: 7,
                    discountPct: 2,
                    priceValidityDate: '2026-03-15',
                    deliveryDate: '2026-03-25',
                    notes: 'Standard mill packaging included.'
                },
                'ITEM-GP-021': {
                    itemPrice: 54500,
                    leadTimeDays: 10,
                    discountPct: 0,
                    priceValidityDate: '2026-03-15',
                    deliveryDate: '2026-03-30',
                    notes: 'Custom width processing takes extra time.'
                }
            },
            shippingCost: 15000,
            taxPct: 18,
            termsAndConditions: '1. Prices are ex-works.\n2. Payment as per RFQ terms.\n3. Goods once sold will not be taken back.'
        }
    },
    {
        rfqNumber: 'RFQ-2026-0029',
        issueDate: '05-02-2026',
        dueDate: '15-02-2026',
        approxValue: 398000,
        specialInstructions: '',
        status: 'Closed',
        paymentTerms: 'Net 45 days',
        lineItems: [
            {
                itemCode: 'ITEM-CUT-030',
                description: 'Cut Sheet SAE 1008 — 4ft x 8ft',
                quantity: 60,
                uom: 'Nos',
                attachments: ['Spec_SAE1008.pdf'],
            },
        ],
    },
    {
        rfqNumber: 'RFQ-2026-0022',
        issueDate: '28-01-2026',
        dueDate: '07-02-2026',
        approxValue: 215000,
        specialInstructions: 'Sample pieces required before bulk order confirmation.',
        status: 'Expired',
        paymentTerms: 'Net 30 days',
        lineItems: [
            {
                itemCode: 'ITEM-STR-040',
                description: 'Strip ASTM A653 — Width 50mm',
                quantity: 500,
                uom: 'Kg',
                attachments: [],
            },
            {
                itemCode: 'ITEM-STR-041',
                description: 'Strip ASTM A653 — Width 75mm',
                quantity: 300,
                uom: 'Kg',
                attachments: [],
            },
        ],
    },
];

// ─── Trip Module Mock Data ──────────────────────────────────────────────────

export const VEHICLE_REASSIGN_REASONS = [
    'Vehicle Breakdown', 'Accident', 'Maintenance Required', 'Capacity Issue', 'Other'
];

export const DRIVER_REASSIGN_REASONS = [
    'Health Issue', 'Personal Emergency', 'No Show', 'License Expired', 'Accident', 'Other'
];

export let TRIPS = [
    {
        id: 'TR-2024-001', status: 'Cancelled',
        shipmentId: 'SH-2026-0001', customer: 'JSW Steel Ltd',
        vehiclePlate: 'MH-17-AB-1234', driverName: 'Rajesh Ramesh',
        invoiceRef: 'INV-2025-001',
        startTime: '20-11-2025 10:00', endTime: null,
        createdDate: '20-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '20-11-2025 09:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: null, by: null, done: false },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-002', status: 'Completed',
        shipmentId: 'SH-2026-0003', customer: 'Jindal Steel',
        vehiclePlate: 'MH-17-AB-1234', driverName: 'Rajesh Ramesh',
        invoiceRef: 'INV-2025-004',
        startTime: '20-11-2025 10:00', endTime: '20-11-2025 18:30',
        createdDate: '20-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '20-11-2025 09:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: '20-11-2025 10:00', by: 'System', done: true },
            { event: 'Location Update: En Route', date: '20-11-2025 14:20', by: 'System', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-003', status: 'Scheduled',
        shipmentId: 'SH-2026-0001', customer: 'JSW Steel Ltd',
        vehiclePlate: 'MH-17-AB-1234', driverName: 'Suresh Patil',
        invoiceRef: 'INV-2025-001',
        startTime: '20-11-2025 10:00', endTime: null,
        createdDate: '20-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '20-11-2025 09:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: null, by: null, done: false },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-004', status: 'Scheduled',
        shipmentId: 'SH-2026-0001', customer: 'Tata Steel',
        vehiclePlate: 'MH-04-CD-5678', driverName: 'Dinesh Kumar',
        invoiceRef: 'INV-2025-002',
        startTime: '20-11-2025 10:00', endTime: null,
        createdDate: '20-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '20-11-2025 09:00', by: 'Priya M', done: true },
            { event: 'Vehicle Dispatched', date: null, by: null, done: false },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-005', status: 'In Progress',
        shipmentId: 'SH-2026-0002', customer: 'SAIL',
        vehiclePlate: 'MH-17-AB-1234', driverName: 'Rajesh Ramesh',
        invoiceRef: 'INV-2025-003',
        startTime: '20-11-2025 10:00', endTime: null,
        createdDate: '20-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '20-11-2025 09:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: '28-11-2025 14:15', by: 'System', done: true },
            { event: 'Location Update: En Route', date: '02-12-2025 10:20', by: 'System', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-006', status: 'Cancelled',
        shipmentId: 'SH-2026-0004', customer: 'Essar Steel',
        vehiclePlate: 'MH-09-GH-3456', driverName: 'Dinesh Kumar',
        invoiceRef: 'INV-2025-005',
        startTime: '20-11-2025 10:00', endTime: null,
        createdDate: '20-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '20-11-2025 09:30', by: 'Ravi K', done: true },
            { event: 'Cancelled', date: '20-11-2025 11:00', by: 'Ravi K', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-007', status: 'Completed',
        shipmentId: 'SH-2026-0003', customer: 'Jindal Steel',
        vehiclePlate: 'MH-04-CD-5678', driverName: 'Suresh Patil',
        invoiceRef: 'INV-2025-004',
        startTime: '19-11-2025 09:00', endTime: '19-11-2025 16:45',
        createdDate: '19-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '19-11-2025 07:00', by: 'Priya M', done: true },
            { event: 'Vehicle Dispatched', date: '19-11-2025 09:00', by: 'Priya M', done: true },
            { event: 'Location Update: En Route', date: '19-11-2025 12:30', by: 'System', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-008', status: 'In Progress',
        shipmentId: 'SH-2026-0001', customer: 'JSW Steel Ltd',
        vehiclePlate: 'MH-17-AB-1234', driverName: 'Rajesh Ramesh',
        invoiceRef: 'INV-2025-001',
        startTime: '21-11-2025 08:30', endTime: null,
        createdDate: '21-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '21-11-2025 08:00', by: 'Ravi K', done: true },
            { event: 'Vehicle Dispatched', date: '21-11-2025 08:30', by: 'System', done: true },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-009', status: 'Completed',
        shipmentId: 'SH-2026-0003', customer: 'Tata Steel',
        vehiclePlate: 'MH-09-GH-3456', driverName: 'Dinesh Kumar',
        invoiceRef: 'INV-2025-002',
        startTime: '18-11-2025 07:00', endTime: '18-11-2025 15:00',
        createdDate: '18-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '18-11-2025 06:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: '18-11-2025 07:00', by: 'System', done: true },
            { event: 'Location Update: En Route', date: '18-11-2025 11:00', by: 'System', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-010', status: 'Cancelled',
        shipmentId: 'SH-2026-0004', customer: 'Essar Steel',
        vehiclePlate: 'MH-04-CD-5678', driverName: 'Suresh Patil',
        invoiceRef: 'INV-2025-005',
        startTime: '17-11-2025 10:00', endTime: null,
        createdDate: '17-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '17-11-2025 09:00', by: 'Priya M', done: true },
            { event: 'Cancelled', date: '17-11-2025 12:00', by: 'Priya M', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-011', status: 'In Progress',
        shipmentId: 'SH-2026-0002', customer: 'SAIL',
        vehiclePlate: 'MH-09-GH-3456', driverName: 'Dinesh Kumar',
        invoiceRef: 'INV-2025-003',
        startTime: '22-11-2025 06:00', endTime: null,
        createdDate: '22-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '22-11-2025 05:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: '22-11-2025 06:00', by: 'System', done: true },
            { event: 'Location Update: En Route', date: '22-11-2025 10:15', by: 'System', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-012', status: 'Scheduled',
        shipmentId: 'SH-2026-0005', customer: 'Tata Steel',
        vehiclePlate: 'MH-04-CD-5678', driverName: 'Suresh Patil',
        invoiceRef: 'INV-2025-002',
        startTime: '23-11-2025 08:00', endTime: null,
        createdDate: '23-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '23-11-2025 07:30', by: 'Ravi K', done: true },
            { event: 'Vehicle Dispatched', date: null, by: null, done: false },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-013', status: 'Completed',
        shipmentId: 'SH-2026-0001', customer: 'JSW Steel Ltd',
        vehiclePlate: 'MH-17-AB-1234', driverName: 'Rajesh Ramesh',
        invoiceRef: 'INV-2025-001',
        startTime: '16-11-2025 09:00', endTime: '16-11-2025 17:30',
        createdDate: '16-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '16-11-2025 08:00', by: 'Priya M', done: true },
            { event: 'Vehicle Dispatched', date: '16-11-2025 09:00', by: 'System', done: true },
            { event: 'Location Update: En Route', date: '16-11-2025 13:00', by: 'System', done: true },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-014', status: 'In Progress',
        shipmentId: 'SH-2026-0002', customer: 'Meenakshi Steel',
        vehiclePlate: 'MH-04-CD-5678', driverName: 'Suresh Patil',
        invoiceRef: 'INV-2025-003',
        startTime: '22-11-2025 14:00', endTime: null,
        createdDate: '22-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '22-11-2025 13:00', by: 'Ravi K', done: true },
            { event: 'Vehicle Dispatched', date: '22-11-2025 14:00', by: 'System', done: true },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
    {
        id: 'TR-2024-015', status: 'Scheduled',
        shipmentId: 'SH-2026-0005', customer: 'ABC Steel Ltd',
        vehiclePlate: 'MH-09-GH-3456', driverName: 'Dinesh Kumar',
        invoiceRef: 'INV-2025-005',
        startTime: '24-11-2025 07:00', endTime: null,
        createdDate: '24-11-2025',
        timeline: [
            { event: 'Transit Entry Created', date: '24-11-2025 06:30', by: 'John Doe', done: true },
            { event: 'Vehicle Dispatched', date: null, by: null, done: false },
            { event: 'Location Update: En Route', date: null, by: null, done: false },
        ],
        reassignments: []
    },
];

// ─── Machine Management Mock Data ─────────────────────────────────────────────

export let MACHINES_DATA = [
    {
        id: 'SLT-01', name: 'Primary Slitter', type: 'Slitting Machine',
        modelNumber: 'SLT-1000X', serialNumber: 'SN-2022-001',
        productionLine: 'Slitting Line A', status: 'Active',
        nextMaintenanceDate: '28-11-2025'
    },
    {
        id: 'SLT-02', name: 'Secondary Slitter', type: 'Slitting Machine',
        modelNumber: 'SLT-800Y', serialNumber: 'SN-2021-045',
        productionLine: 'Slitting Line B', status: 'Under Breakdown',
        nextMaintenanceDate: '15-12-2025'
    },
    {
        id: 'CUT-01', name: 'Heavy Duty Cutter', type: 'Cutting Machine',
        modelNumber: 'CUT-HD-500', serialNumber: 'SN-2023-012',
        productionLine: 'Cutting Line A', status: 'Under Preventive Maintenance',
        nextMaintenanceDate: '24-02-2026'
    },
    {
        id: 'CUT-02', name: 'Precision Cutter', type: 'Cutting Machine',
        modelNumber: 'CUT-PR-200', serialNumber: 'SN-2020-088',
        productionLine: 'Cutting Line B', status: 'Active',
        nextMaintenanceDate: '10-03-2026'
    },
];

export let BREAKDOWN_RECORDS = [
    {
        id: 'BRK-2026-001', machineId: 'SLT-02', machineName: 'Secondary Slitter',
        startTime: '23-02-2026 14:30', reportedBy: 'Ravi K', priority: 'High',
        reason: 'Hydraulic leak', symptoms: 'Pressure dropping during operation.',
        immediateActions: 'Stopped machine and closed main valve.',
        affectedWorkOrder: 'WO-2024-003', status: 'Open'
    },
    {
        id: 'BRK-2026-002', machineId: 'SLT-01', machineName: 'Primary Slitter',
        startTime: '10-01-2026 09:00', reportedBy: 'Priya M', priority: 'Medium',
        reason: 'Blade dullness', symptoms: 'Burrs on slit edges.',
        immediateActions: 'Replaced blade set.',
        affectedWorkOrder: null, status: 'Closed' // Has a corresponding maintenance record
    }
];

export let MAINTENANCE_RECORDS = [
    {
        id: 'MNT-2026-001', machineId: 'CUT-01', type: 'Preventive',
        technician: 'Ramesh Singh', scheduledDate: '24-02-2026', scheduleTime: '08:00',
        estimatedDuration: '4 hours', estimatedCost: 5000, status: 'Completed', breakdownId: null
    },
    {
        id: 'MNT-2026-002', machineId: 'SLT-01', type: 'Corrective',
        technician: 'Suresh Kumar', scheduledDate: '10-01-2026', scheduleTime: '10:00',
        estimatedDuration: '2 hours', estimatedCost: 15000, status: 'Completed', breakdownId: 'BRK-2026-002'
    }
];

// Helper functions for Machine Management state transitions
export function reportBreakdown(record) {
    const machine = MACHINES_DATA.find(m => m.id === record.machineId);
    if (!machine || machine.status !== 'Active') {
        throw new Error('Machine must be in Active state to report a breakdown.');
    }
    const openBreakdown = BREAKDOWN_RECORDS.find(br => br.machineId === record.machineId && br.status !== 'Closed');
    if (openBreakdown) {
        throw new Error('An open breakdown already exists for this machine.');
    }

    // Create new breakdown
    const newRecord = { ...record, status: 'Open', id: 'BRK-' + Date.now() };
    BREAKDOWN_RECORDS.unshift(newRecord);

    // Update machine state
    machine.status = 'Under Breakdown';
    return newRecord;
}

export function scheduleMaintenance(record) {
    const machine = MACHINES_DATA.find(m => m.id === record.machineId);
    if (!machine) throw new Error('Machine not found.');

    if (record.type === 'Preventive') {
        if (machine.status !== 'Active') {
            throw new Error('Machine must be Active to schedule preventive maintenance.');
        }
    } else if (record.type === 'Corrective') {
        const breakdown = BREAKDOWN_RECORDS.find(br => br.id === record.breakdownId);
        if (!breakdown || (breakdown.status !== 'Open' && breakdown.status !== 'In Repair')) {
            throw new Error('Valid Open breakdown required for corrective maintenance.');
        }
    }

    const newMaintenance = { ...record, status: 'Scheduled', id: 'MNT-' + Date.now() };
    MAINTENANCE_RECORDS.unshift(newMaintenance);
    return newMaintenance;
}

export function executeMaintenanceStateChange(maintenanceId, action) {
    const maintenance = MAINTENANCE_RECORDS.find(m => m.id === maintenanceId);
    if (!maintenance) return;
    const machine = MACHINES_DATA.find(m => m.id === maintenance.machineId);

    if (action === 'Start') {
        maintenance.status = 'In Progress';
        machine.status = maintenance.type === 'Preventive' ? 'Under Preventive Maintenance' : 'Under Corrective Maintenance';
        if (maintenance.type === 'Corrective' && maintenance.breakdownId) {
            const breakdown = BREAKDOWN_RECORDS.find(b => b.id === maintenance.breakdownId);
            if (breakdown) breakdown.status = 'In Repair';
        }
    } else if (action === 'Complete') {
        maintenance.status = 'Completed';
        machine.status = 'Active';
        if (maintenance.type === 'Corrective' && maintenance.breakdownId) {
            const breakdown = BREAKDOWN_RECORDS.find(b => b.id === maintenance.breakdownId);
            if (breakdown) breakdown.status = 'Closed';
        }
    }
}
