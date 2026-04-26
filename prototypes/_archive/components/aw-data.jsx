/* global */
// Realistic Thai mock data for AquaWise

const HATCHERY = {
  name: 'ฟ้าใส แฮทเชอรี่',
  nameEn: 'Fasai Hatchery',
  location: 'สมุทรสาคร',
  locationEn: 'Samut Sakhon',
};

const CUSTOMERS = [
  { id: 'C001', name: 'สมชาย ใจดี', farm: 'ฟาร์มกุ้งบ้านสวน', farmEn: 'Bansuan Shrimp Farm',
    zone: 'สมุทรสาคร', batches: 8, ltv: 184000, lastBuy: '2026-04-12',
    cycleDay: 78, expectedHarvest: '2026-06-09', d30: 84, d60: 79, restockIn: 14, status: 'active' },
  { id: 'C002', name: 'ประยุทธ พงษ์ศรี', farm: 'พงษ์ศรีฟาร์ม', farmEn: 'Phongsri Farm',
    zone: 'ฉะเชิงเทรา', batches: 14, ltv: 392000, lastBuy: '2026-04-22',
    cycleDay: 24, expectedHarvest: '2026-08-04', d30: null, d60: null, restockIn: 92, status: 'active' },
  { id: 'C003', name: 'มาลี รุ่งเรือง', farm: 'รุ่งเรืองฟาร์ม 2', farmEn: 'Rungrueang Farm 2',
    zone: 'สมุทรสงคราม', batches: 5, ltv: 96000, lastBuy: '2026-03-30',
    cycleDay: 92, expectedHarvest: '2026-05-26', d30: 71, d60: 64, restockIn: 4, status: 'restock-soon' },
  { id: 'C004', name: 'อนันต์ สุขสบาย', farm: 'สุขสบายฟาร์ม', farmEn: 'Suksabai Farm',
    zone: 'ฉะเชิงเทรา', batches: 11, ltv: 268000, lastBuy: '2026-04-19',
    cycleDay: 35, expectedHarvest: '2026-07-22', d30: 88, d60: null, restockIn: 78, status: 'active' },
  { id: 'C005', name: 'วิภา ทองสุข', farm: 'ทองสุขฟาร์ม', farmEn: 'Thongsuk Farm',
    zone: 'สมุทรสาคร', batches: 3, ltv: 54000, lastBuy: '2026-04-02',
    cycleDay: 65, expectedHarvest: '2026-06-22', d30: 42, d60: 38, restockIn: 38, status: 'concern' },
  { id: 'C006', name: 'ธนากร เกษตรทรัพย์', farm: 'เกษตรทรัพย์ฟาร์ม', farmEn: 'Kasetsap Farm',
    zone: 'เพชรบุรี', batches: 22, ltv: 612000, lastBuy: '2026-04-25',
    cycleDay: 8, expectedHarvest: '2026-08-20', d30: null, d60: null, restockIn: 110, status: 'active' },
  { id: 'C007', name: 'จันทร์เพ็ญ มั่นคง', farm: 'มั่นคงฟาร์ม', farmEn: 'Mankhong Farm',
    zone: 'สมุทรสาคร', batches: 9, ltv: 198000, lastBuy: '2026-04-08',
    cycleDay: 105, expectedHarvest: '2026-05-12', d30: 81, d60: 76, restockIn: 0, status: 'restock-now' },
  { id: 'C008', name: 'พิชัย วงศ์ใหญ่', farm: 'วงศ์ใหญ่ฟาร์ม', farmEn: 'Wongyai Farm',
    zone: 'ฉะเชิงเทรา', batches: 6, ltv: 142000, lastBuy: '2025-10-04',
    cycleDay: null, expectedHarvest: null, d30: null, d60: null, restockIn: null, status: 'quiet' },
  { id: 'C009', name: 'รัชนี โพธิ์ทอง', farm: 'โพธิ์ทองฟาร์ม', farmEn: 'Phothong Farm',
    zone: 'สมุทรสงคราม', batches: 12, ltv: 304000, lastBuy: '2026-04-18',
    cycleDay: 42, expectedHarvest: '2026-07-12', d30: 79, d60: null, restockIn: 70, status: 'active' },
];

const BATCHES = [
  { id: 'B-2604-A', date: '2026-04-22', source: 'CP-Genetics Line A', plProduced: 2_400_000,
    plSold: 1_820_000, farms: 6, meanD30: 84, dist: [1,2,4,7,12,18,24,16,8,3], pcr: 'clean' },
  { id: 'B-2604-B', date: '2026-04-19', source: 'SyAqua Line 7', plProduced: 1_800_000,
    plSold: 1_650_000, farms: 5, meanD30: 79, dist: [2,3,5,8,14,16,20,15,9,4], pcr: 'clean' },
  { id: 'B-2604-C', date: '2026-04-12', source: 'CP-Genetics Line A', plProduced: 2_200_000,
    plSold: 2_200_000, farms: 7, meanD30: 76, dist: [3,5,8,12,16,18,15,11,7,3], pcr: 'clean' },
  { id: 'B-2603-D', date: '2026-03-30', source: 'Shrimp Improvement Sys.', plProduced: 1_600_000,
    plSold: 1_600_000, farms: 4, meanD30: 68, dist: [5,8,11,14,16,15,12,9,6,3], pcr: 'flagged' },
  { id: 'B-2603-C', date: '2026-03-22', source: 'CP-Genetics Line B', plProduced: 2_000_000,
    plSold: 2_000_000, farms: 6, meanD30: 82, dist: [1,3,5,8,12,17,22,17,9,4], pcr: 'clean' },
];

const PRICES = {
  date: '26 เม.ย. 2026',
  source: 'ตลาดทะเลไทย สมุทรสาคร',
  rows: [
    { size: 40, price: 248, delta: +4, avg3y: 232 },
    { size: 50, price: 215, delta: +2, avg3y: 208 },
    { size: 60, price: 188, delta: -1, avg3y: 184 },
    { size: 70, price: 162, delta: -3, avg3y: 168 },
    { size: 80, price: 138, delta: 0,  avg3y: 145 },
  ],
};

window.AW_DATA = { HATCHERY, CUSTOMERS, BATCHES, PRICES };
