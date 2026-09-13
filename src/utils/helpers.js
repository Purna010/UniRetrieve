import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr) {
  try {
    return format(parseISO(dateStr), 'h:mm a');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy · h:mm a');
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function getCategoryColor(category) {
  const map = {
    'Electronics': '#00f5ff',
    'Bags & Luggage': '#a855f7',
    'Accessories': '#ff8800',
    'Documents & Cards': '#ff006e',
    'Personal Items': '#00ff88',
    'Clothing': '#0080ff',
    'Books & Stationery': '#ffdc00',
    'Sports Equipment': '#ff6b35',
    'Other': '#888',
  };
  return map[category] || '#888';
}

export function getStatusLabel(status) {
  const map = {
    lost: 'Lost',
    found: 'Found',
    matched: 'Matched',
    claimed: 'Claimed',
    pending_claim: 'Pending Claim',
  };
  return map[status] || status;
}

export function getStatusClass(status) {
  const map = {
    lost: 'status-lost',
    found: 'status-found',
    matched: 'status-matched',
    claimed: 'status-claimed',
    pending_claim: 'status-matched',
  };
  return map[status] || 'status-lost';
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function truncate(str, n = 80) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function getScoreColor(score) {
  if (score >= 90) return '#00ff88';
  if (score >= 75) return '#00f5ff';
  if (score >= 60) return '#ff8800';
  return '#ff006e';
}

export function formatHashShort(hash) {
  if (!hash) return '';
  return hash.slice(0, 10) + '...' + hash.slice(-4);
}
