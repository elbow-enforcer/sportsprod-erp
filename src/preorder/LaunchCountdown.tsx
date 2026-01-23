import { useMemo } from 'react';
import {
  usePreorderStore,
  getDaysUntilLaunch,
  getWeeksUntilLaunch,
  getLaunchStatus,
  formatLaunchDate,
} from '../stores/preorderStore';

interface CountdownBlockProps {
  value: number | string;
  label: string;
  highlight?: boolean;
}

function CountdownBlock({ value, label, highlight }: CountdownBlockProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg ${
        highlight ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <span className="text-3xl font-bold">{value}</span>
      <span className={`text-sm ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

export function LaunchCountdown() {
  const { launchDate } = usePreorderStore();

  const status = getLaunchStatus(launchDate);
  const daysUntil = getDaysUntilLaunch(launchDate);
  const weeksUntil = getWeeksUntilLaunch(launchDate);
  const formattedDate = formatLaunchDate(launchDate);

  const countdown = useMemo(() => {
    if (daysUntil === null) return null;
    const absDay = Math.abs(daysUntil);
    const weeks = Math.floor(absDay / 7);
    const days = absDay % 7;
    const months = Math.floor(absDay / 30);
    return { weeks, days, months, total: absDay };
  }, [daysUntil]);

  if (status === 'not-set') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Countdown</h3>
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">📅</span>
          <p className="text-gray-500">No launch date configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Set a launch date in Pre-order Settings to see countdown
          </p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    past: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: '✅',
      title: 'Launched!',
      subtitle: `Launched ${Math.abs(daysUntil!)} days ago`,
    },
    today: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '🎉',
      title: 'Launch Day!',
      subtitle: 'Today is the big day!',
    },
    imminent: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: '🔥',
      title: 'Launch Imminent',
      subtitle: `Only ${daysUntil} days to go!`,
    },
    upcoming: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: '🚀',
      title: 'Countdown to Launch',
      subtitle: formattedDate,
    },
    'not-set': {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: '📅',
      title: 'Not Set',
      subtitle: '',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`rounded-xl shadow-sm border ${config.border} ${config.bg} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Launch Countdown</h3>
        <span className="text-2xl">{config.icon}</span>
      </div>

      <p className="text-xl font-bold text-gray-900 mb-1">{config.title}</p>
      <p className="text-sm text-gray-500 mb-6">{config.subtitle}</p>

      {status !== 'past' && status !== 'today' && countdown && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {countdown.months > 0 && (
            <CountdownBlock
              value={countdown.months}
              label={countdown.months === 1 ? 'Month' : 'Months'}
            />
          )}
          <CountdownBlock
            value={countdown.weeks}
            label={countdown.weeks === 1 ? 'Week' : 'Weeks'}
            highlight={countdown.weeks > 0 && countdown.months === 0}
          />
          <CountdownBlock
            value={countdown.days}
            label={countdown.days === 1 ? 'Day' : 'Days'}
            highlight={countdown.weeks === 0}
          />
          <CountdownBlock
            value={countdown.total}
            label="Total Days"
            highlight
          />
        </div>
      )}

      {status === 'today' && (
        <div className="flex justify-center py-4">
          <div className="text-center animate-pulse">
            <span className="text-6xl">🎊</span>
            <p className="text-green-700 font-semibold mt-2">Congratulations!</p>
          </div>
        </div>
      )}

      {weeksUntil !== null && weeksUntil > 0 && status !== 'past' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Weeks until launch</span>
            <span className="font-semibold text-gray-900">{weeksUntil} weeks</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaunchCountdown;
