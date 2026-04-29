export default function StatCard({ title, value, icon, trend, colorClass }) {
  let iconBg = 'bg-gray-100 text-gray-600';
  if (colorClass === 'primary') iconBg = 'bg-indigo-100 text-indigo-600';
  if (colorClass === 'success') iconBg = 'bg-emerald-100 text-emerald-600';
  if (colorClass === 'danger') iconBg = 'bg-red-100 text-red-600';
  if (colorClass === 'warning') iconBg = 'bg-amber-100 text-amber-600';

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <span className={`font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
