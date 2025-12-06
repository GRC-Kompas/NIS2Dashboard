'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RiskScore {
  overall_score: number;
  governance_score: number;
  risk_management_score: number;
  incident_score: number;
  suppliers_score: number;
  calculated_at: string;
  method_version?: string | null;
}

interface Organisation {
  id: string;
  name: string;
  nis2_segment: string;
  risk_scores: RiskScore[];
}

interface Action {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'done';
  category: string;
  due_date: string | null;
}

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [org, setOrg] = useState<Organisation | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch Org & Score
            const orgRes = await fetch(`/api/organisations/${id}`);
            if (orgRes.status === 401) { router.push('/login'); return; }
            if (orgRes.status === 403) { setError('Access Denied'); setLoading(false); return; }
            if (!orgRes.ok) throw new Error('Failed to fetch organisation');
            const orgData = await orgRes.json();
            setOrg(orgData);

            // Fetch Actions
            const actionsRes = await fetch(`/api/organisations/${id}/actions?status=open`); // Show open by default or all? Let's show all but filter in UI or API
            if (actionsRes.ok) {
                const actionsData = await actionsRes.json();
                setActions(actionsData);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id, router]);

  const handleActionStatusChange = async (actionId: string, newStatus: string) => {
      try {
          const res = await fetch(`/api/actions/${actionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              // Refresh actions
              const updated = await res.json();
              setActions(actions.map(a => a.id === actionId ? {...a, status: updated.status} : a));
          }
      } catch (e) {
          console.error('Failed to update action', e);
      }
  };

  if (loading) return <div className="p-4">Loading details...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!org) return <div className="p-4">Organisation not found</div>;

  const latestScore = org.risk_scores[0];

  const chartData = latestScore ? [
      { name: 'Governance', score: latestScore.governance_score },
      { name: 'Risk Mgmt', score: latestScore.risk_management_score },
      { name: 'Incident', score: latestScore.incident_score },
      { name: 'Suppliers', score: latestScore.suppliers_score },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <p className="mt-1 text-sm text-gray-500">Segment: <Badge color="blue">{org.nis2_segment}</Badge></p>
        </div>
        <div className="text-right">
             <div className="text-sm text-gray-500">Overall Compliance Score</div>
             <div className="text-4xl font-bold text-blue-600">{latestScore?.overall_score ?? 'N/A'}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Chart */}
        <Card>
            <CardHeader title="Compliance by Category" />
            <CardContent>
                {latestScore ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">No score data available</div>
                )}
            </CardContent>
        </Card>

        {/* Quick Stats or Info */}
        <Card>
            <CardHeader title="Quick Stats" />
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-gray-600">Last Assessment</span>
                   <span className="font-medium">{latestScore ? new Date(latestScore.calculated_at).toLocaleDateString() : 'Never'}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-gray-600">Open Actions</span>
                   <span className="font-medium text-red-600">{actions.filter(a => a.status === 'open').length}</span>
               </div>
               <div className="flex justify-between items-center">
                   <span className="text-gray-600">Method Version</span>
                   <span className="font-medium text-gray-400">{latestScore?.method_version || 'v1.0'}</span>
               </div>
            </CardContent>
        </Card>
      </div>

      {/* Actions Table */}
      <Card>
          <CardHeader title="Improvement Actions" />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manage</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {actions.map(action => (
                        <tr key={action.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                    action.status === 'open' ? "bg-red-100 text-red-800" :
                                    action.status === 'in_progress' ? "bg-yellow-100 text-yellow-800" :
                                    "bg-green-100 text-green-800"
                                )}>
                                    {action.status.replace('_', ' ')}
                                </span>
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
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{action.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {action.category.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <select
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={action.status}
                                    onChange={(e) => handleActionStatusChange(action.id, e.target.value)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                    {actions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No improvement actions found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
