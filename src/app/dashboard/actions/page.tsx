'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { cn } from '@/components/ui';

interface Action {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'done';
  category: string;
  due_date: string | null;
  organisation?: { name: string };
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/actions')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setActions(data);
          setLoading(false);
      })
      .catch(err => {
          console.error(err);
          setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading actions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Improvement Actions</h1>
        <p className="text-gray-500">Manage all pending actions to improve NIS2 compliance.</p>
      </div>

      <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Org</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {actions.map(action => (
                        <tr key={action.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {action.organisation?.name || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                {action.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge color={
                                    action.status === 'done' ? 'green' :
                                    action.status === 'in_progress' ? 'yellow' : 'red'
                                }>
                                    {action.status.replace('_', ' ')}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                    "text-sm font-medium",
                                    action.priority === 'high' ? "text-red-600" :
                                    action.priority === 'medium' ? "text-yellow-600" : "text-gray-600"
                                )}>
                                    {action.priority.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {action.category?.replace('_', ' ')}
                            </td>
                        </tr>
                    ))}
                    {actions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No actions found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}
