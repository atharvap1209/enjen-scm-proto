export const screenerStocks = Array.from({ length: 50 }, (_, i) => ({
    id: `COIL-${Math.floor(Math.random() * 900000) + 100000}`,
    category: ['AU', 'CRC', 'HRPO'][Math.floor(Math.random() * 3)],
    grade: ['D', 'NORMAL', 'SKINPASS', '2062', 'HRPO - Deal'][Math.floor(Math.random() * 5)],
    coating: `${[0, 3, 44, 100, 104][Math.floor(Math.random() * 5)]} GSM`,
    surfaceFinish: ['-', 'CRCA', 'HRPO'][Math.floor(Math.random() * 3)],
    thickness: (Math.random() * 5).toFixed(2) + ' mm',
    width: (Math.random() * 1500 + 500).toFixed(2) + ' mm',
    length: (Math.random() * 1000).toFixed(2) + ' mm',
    weight: (Math.random() * 2000 + 20).toFixed(3),
    remarks1: '',
    remarks2: '',
    remarks3: '',
}));

export const screenerFilters = {
    surface: ['CRCA', 'HRPO'],
    category: ['AU', 'CRC'],
    coating: [0, 1, 2, 3, 4, 34, 44, 45, 46.2, 47, 47.1, 48, 48.1, 49, 50, 51, 52, 53, 54, 55, 56, 60, 80, 90, 92, 100, 104],
    thickness: [0, 0.2, 0.28, 0.3, 0.32, 0.33, 0.35, 0.37, 0.38, 0.4, 0.42, 0.45, 0.46, 0.47, 0.48, 0.5, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6, 0.61],
    width: [0, 0.785, 3, 5, 6, 12, 25, 28, 32, 37, 40, 50, 55, 58, 65, 69.5, 71, 74, 75, 77, 82, 83.5, 84, 85, 88, 89, 90],
    grade: ['NORMAL', 'SKINPASS', 'D', 'SKIN PASS X AFP', '2062', 'HRPO - Deal', 'CR - Deal', 'SKPS - Deal', 'Normal - Deal'],
    item: ['N/A - Default Type', 'CR COIL', 'GR COIL'],
    plant: ['Vijayanagar']
};
