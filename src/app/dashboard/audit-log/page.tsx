'use client';

import { useEffect, useState } from 'react';
import { Card, Badge } from '@/components/ui';

interface Log {
  id: string;
  action: string;
  user: { email: string };
  organisation: { name: string };
  created_at: string;
  details?: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-log')
      .then(res => {
          if (res.status === 403) throw new Error('Forbidden');
          return res.json();
      })
      .then(data => {
          setLogs(data);
          setLoading(false);
      })
      .catch(e => {
          console.error(e);
          setLoading(false);
      });
  }, []);

  if (loading) return <div>Laden...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500">Volledig overzicht van kritieke wijzigingen en acties voor compliance verantwoording.</p>
      </div>

      <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tijdstip</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gebruiker</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisatie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user?.email || 'Systeem'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.organisation?.name || 'Global'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge color="gray">{log.action}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 max-w-xs truncate">
                                {log.details}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}
