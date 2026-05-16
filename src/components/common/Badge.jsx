import React from 'react';

const roleColors = {
  admin:      'bg-secondary/10 text-secondary border-secondary/20',
  caseworker: 'bg-blue-50 text-blue-700 border-blue-200',
  client:     'bg-green-50 text-green-700 border-green-200',
  candidate:  'bg-green-50 text-green-700 border-green-200',
  sponsor:    'bg-amber-50 text-amber-700 border-amber-200',
  business:   'bg-amber-50 text-amber-700 border-amber-200',
  superadmin: 'bg-secondary text-white border-secondary',
};

const statusColors = {
  Active:    'bg-green-50 text-green-700 border-green-200',
  Trial:     'bg-amber-50 text-amber-700 border-amber-200',
  Suspended: 'bg-red-50 text-red-700 border-red-200',
  Inactive:  'bg-gray-50 text-gray-500 border-gray-200',
  Pending:   'bg-amber-50 text-amber-600 border-amber-200',
  Paid:      'bg-green-50 text-green-700 border-green-200',
  Overdue:   'bg-red-50 text-red-700 border-red-200',
};

export const RoleBadge = ({ role }) => {
  const key = role?.toLowerCase();
  const cls = roleColors[key] ?? 'bg-gray-50 text-gray-500 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const cls = statusColors[status] ?? statusColors.Inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {status}
    </span>
  );
};
