export default function StatusBadge({ status }) {
  const normalizedStatus = status ? status.toLowerCase() : 'new';
  
  let colors = 'bg-gray-100 text-gray-800'; // new
  if (normalizedStatus === 'contacted') colors = 'bg-blue-100 text-blue-800';
  if (normalizedStatus === 'qualified') colors = 'bg-amber-100 text-amber-800';
  if (normalizedStatus === 'proposal sent') colors = 'bg-purple-100 text-purple-800';
  if (normalizedStatus === 'lost') colors = 'bg-red-100 text-red-800';
  if (normalizedStatus === 'won' || normalizedStatus === 'converted') colors = 'bg-emerald-100 text-emerald-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${colors}`}>
      {status || 'New'}
    </span>
  );
}
