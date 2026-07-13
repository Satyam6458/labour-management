export const WORK_SUB_TYPES = [
  { name: 'Normal Work', multiplier: 1.0 },
  { name: 'Cement Work', multiplier: 1.2 },
  { name: 'Plaster Work', multiplier: 1.3 },
  { name: 'Tile Work', multiplier: 1.25 },
  { name: 'Painting Work', multiplier: 1.1 },
  { name: 'Extra Heavy Work', multiplier: 1.5 },
];

export const PAYMENT_SUB_TYPES = ['Regular', 'Advance', 'Old Payment'];

export const WORK_CATEGORIES = [
  'Mason', 'Carpenter', 'Helper', 'Painter', 'Plumber', 'Electrician', 'Welder', 'Driver', 'Other'
];

export const ATTENDANCE_STATUSES = ['Full Day', 'Half Day', 'Absent', 'Overtime'];

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function getBadgeClass(status) {
  if (status === 'Absent') return 'badge-absent';
  if (status === 'Half Day') return 'badge-halfday';
  if (status === 'Overtime') return 'badge-overtime';
  return 'badge-present';
}