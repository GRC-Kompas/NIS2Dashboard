'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, Badge, Button, cn } from '@/components/ui';
import { getRiskLevel, getRiskColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock, ArrowUpRight, Download } from 'lucide-react';

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

interface User {
    role: 'consultant' | 'client';
}

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [org, setOrg] = useState<Organisation | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Need to know current user role for UI logic
            // We can infer it from the fact that if we access /api/organisations (list) and it works, we are consultant?
            // Or better, let's just create a /api/auth/me endpoint or check login response cookie?
            // Given constraints, I will assume if I can fetch the org without owning it (checking against a known owner ID logic is hard on client),
            // wait, the API enforces RBAC.
            // Let's rely on a simple client-side check if we had user info.
            // Since I didn't store user info in a global context yet, I'll fetch it from a new lightweight endpoint or just infer.
            // Let's implement a quick user check via the existing login response logic stored in localStorage? No, bad practice.
            // I'll make a call to /api/auth/session if I had one.
            // Workaround: I'll assume Client role unless I see evidence otherwise? No.
            // I'll fetch /api/organisations. If it returns 200 array, I'm a consultant. If 403, I'm a client (but I can see this page).
            // Actually, a client receives 403 on /api/organisations.
            const checkRoleRes = await fetch('/api/organisations');
            const isConsultant = checkRoleRes.ok;
            setCurrentUser({ role: isConsultant ? 'consultant' : 'client' });

            // Fetch Org & Score
            const orgRes = await fetch(`/api/organisations/${id}`);
            if (orgRes.status === 401) { router.push('/login'); return; }
            if (orgRes.status === 403) { setError('Access Denied'); setLoading(false); return; }
            if (!orgRes.ok) throw new Error('Failed to fetch organisation');
            const orgData = await orgRes.json();
            setOrg(orgData);

            // Fetch Actions
            const actionsRes = await fetch(`/api/organisations/${id}/actions?status=open`);
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
              const updated = await res.json();
              setActions(actions.map(a => a.id === actionId ? {...a, status: updated.status} : a));
          }
      } catch (e) {
          console.error('Failed to update action', e);
      }
  };

  const handleExport = () => {
      alert("Export feature coming soon in v1.2");
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!org) return <div className="p-8 text-center">Organisation not found</div>;

  const latestScore = org.risk_scores[0];
  const chartData = latestScore ? [
      { name: 'Governance', score: latestScore.governance_score, fullMark: 100 },
      { name: 'Risk Mgmt', score: latestScore.risk_management_score, fullMark: 100 },
      { name: 'Incident', score: latestScore.incident_score, fullMark: 100 },
      { name: 'Suppliers', score: latestScore.suppliers_score, fullMark: 100 },
  ] : [];

  const overallRisk = getRiskLevel(latestScore?.overall_score ?? null);
  const overallColor = getRiskColor(overallRisk);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
                {currentUser?.role === 'consultant' && (
                    <Badge color="brand" className="uppercase tracking-wide">Consultant View</Badge>
                )}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
                <span>Segment: <span className="font-medium text-gray-900">{org.nis2_segment}</span></span>
                <span>Last Updated: <span className="font-medium text-gray-900">{latestScore ? new Date(latestScore.calculated_at).toLocaleDateString() : 'N/A'}</span></span>
            </div>
        </div>
        <div>
             <Button variant="outline" onClick={handleExport}>
                 <Download className="w-4 h-4 mr-2" />
                 Export Report
             </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Scores */}
        <div className="lg:col-span-2 space-y-6">
            {/* Overall Score Card */}
            <Card className="bg-white">
                <CardContent className="flex items-center justify-between py-8">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Overall NIS2 Maturity</h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                            This score reflects the organisation&apos;s adherence to the NIS2 directive based on the latest Quickscan.
                            A score of 100 indicates full compliance with the assessed controls.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className={cn("text-5xl font-bold mb-1",
                            latestScore?.overall_score && latestScore.overall_score >= 80 ? "text-green-600" :
                            latestScore?.overall_score && latestScore.overall_score >= 50 ? "text-yellow-600" : "text-red-600"
                        )}>
                            {latestScore?.overall_score ?? 0}%
                        </div>
                        <Badge color={overallColor}>{overallRisk} Risk</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Category Grid */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                         { title: 'Governance', score: latestScore?.governance_score, desc: 'Board responsibility, training & oversight.' },
                         { title: 'Risk Management', score: latestScore?.risk_management_score, desc: 'Risk analysis, security policies & asset management.' },
                         { title: 'Incident Handling', score: latestScore?.incident_score, desc: 'Prevention, detection, and reporting of incidents.' },
                         { title: 'Supply Chain', score: latestScore?.suppliers_score, desc: 'Security of supply chain & service providers.' }
                     ].map((cat) => (
                         <Card key={cat.title}>
                             <CardContent className="p-5">
                                 <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-semibold text-gray-800">{cat.title}</h4>
                                     <span className={cn("text-lg font-bold", (cat.score ?? 0) >= 50 ? "text-brand-primary" : "text-red-500")}>
                                         {cat.score ?? 0}%
                                     </span>
                                 </div>
                                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                     <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${cat.score}%` }}></div>
                                 </div>
                                 <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                             </CardContent>
                         </Card>
                     ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 italic">
                    * Each category maps to specific articles within the NIS2 directive. Low scores indicate gaps in compliance documentation or technical measures.
                </p>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader title="NIS2 Category Scores" />
                <CardContent>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                <Tooltip
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="score" name="Score" fill="#01689B" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Actions & Callout */}
        <div className="space-y-6">
            {/* Consultant Callout */}
            {currentUser?.role === 'consultant' && (
                <Card className="bg-gradient-to-br from-brand-primary to-sky-700 text-white border-none">
                    <CardContent className="py-8">
                        <h3 className="text-xl font-bold mb-2">Next Step: Roadmap Session</h3>
                        <p className="text-sky-100 mb-6 text-sm leading-relaxed">
                            Based on the current risk profile, we recommend scheduling a roadmap session with the client to prioritize the improvement actions.
                        </p>
                        <Button className="w-full bg-white text-brand-primary hover:bg-gray-100 border-none font-semibold">
                            Plan roadmap sessie
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Actions List */}
            <Card>
                <CardHeader title="Improvement Actions" subtitle="Prioritized tasks to improve score" />
                <div className="divide-y divide-gray-100">
                    {actions.length > 0 ? actions.map(action => (
                        <div key={action.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    action.priority === 'high' ? "text-red-600" :
                                    action.priority === 'medium' ? "text-yellow-600" : "text-gray-500"
                                )}>
                                    {action.priority} Priority
                                </span>
                                <select
                                    className="text-xs border-none bg-transparent text-gray-500 focus:ring-0 cursor-pointer text-right"
                                    value={action.status}
                                    onChange={(e) => handleActionStatusChange(action.id, e.target.value)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{action.title}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500 capitalize">{action.category.replace('_', ' ')}</span>
                                <Badge color={action.status === 'done' ? 'green' : action.status === 'in_progress' ? 'yellow' : 'gray'} className="text-[10px] px-1.5 py-0.5">
                                    {action.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>
                    )) : (
                        <div className="p-6 text-center text-sm text-gray-500">
                            No open actions.
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <button className="text-sm text-brand-primary font-medium hover:text-sky-700 flex items-center justify-center w-full">
                        View all actions <ArrowUpRight className="w-3 h-3 ml-1" />
                    </button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
