'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, Badge, Button, cn } from '@/components/ui';
import { getRiskLevel, getRiskColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Download, Calendar, AlertTriangle, Truck } from 'lucide-react';
import { IncidentWizard } from '@/components/IncidentWizard';

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
  const [showWizard, setShowWizard] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        try {
            const checkRoleRes = await fetch('/api/organisations');
            const isConsultant = checkRoleRes.ok;
            setCurrentUser({ role: isConsultant ? 'consultant' : 'client' });

            const orgRes = await fetch(`/api/organisations/${id}`);
            if (orgRes.status === 401) { router.push('/login'); return; }
            if (orgRes.status === 403) { setError('Toegang geweigerd'); setLoading(false); return; }
            if (!orgRes.ok) throw new Error('Failed to fetch organisation');
            const orgData = await orgRes.json();
            setOrg(orgData);

            const actionsRes = await fetch(`/api/organisations/${id}/actions?status=open`);
            if (actionsRes.ok) {
                const actionsData = await actionsRes.json();
                setActions(actionsData);
            }
        } catch (e) {
            console.error(e);
            setError('Fout bij laden van data');
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
      alert("Exportfunctie beschikbaar in v1.2");
  };

  const handleRoadmapSession = () => {
      const url = process.env.NEXT_PUBLIC_CALENDLY_URL;
      if (url) {
          window.open(url, '_blank');
      } else {
          console.log('NEXT_PUBLIC_CALENDLY_URL not set');
          alert("Opening demo calendar link...");
      }
  };

  const handleWizardSuccess = (incident: any) => {
      setShowWizard(false);
      alert(`Incident "${incident.type}" succesvol gemeld! (Concept)`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!org) return <div className="p-8 text-center">Organisatie niet gevonden</div>;

  const latestScore = org.risk_scores[0];
  const chartData = latestScore ? [
      { name: 'Governance', score: latestScore.governance_score, fullMark: 100 },
      { name: 'Risicomanagement', score: latestScore.risk_management_score, fullMark: 100 },
      { name: 'Incidenten', score: latestScore.incident_score, fullMark: 100 },
      { name: 'Leveranciers', score: latestScore.suppliers_score, fullMark: 100 },
  ] : [];

  const overallRisk = getRiskLevel(latestScore?.overall_score ?? null);
  const overallColor = getRiskColor(overallRisk);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">NIS2-overzicht voor {org.name}</h1>
                {currentUser?.role === 'consultant' && (
                    <Badge color="brand" className="uppercase tracking-wide">Consultant View</Badge>
                )}
            </div>
            <p className="mt-2 text-gray-600 max-w-3xl">
                Deze pagina geeft de actuele NIS2-maturiteit weer van deze MSP op basis van de NIS2 Quickscan.
                De scores zijn verdeeld over governance, risicomanagement, incidentrespons en leveranciersbeheer.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500 gap-4">
                <span>Segment: <span className="font-medium text-gray-900">{org.nis2_segment}</span></span>
                <span>Laatste update: <span className="font-medium text-gray-900">{latestScore ? new Date(latestScore.calculated_at).toLocaleDateString() : 'N/A'}</span></span>
            </div>
        </div>
        <div className="flex gap-2">
             <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={() => setShowWizard(true)}>
                 <AlertTriangle className="w-4 h-4 mr-2" />
                 Meld Incident
             </Button>
             <Button variant="outline" onClick={() => router.push(`/dashboard/org/${org.id}/suppliers`)}>
                 <Truck className="w-4 h-4 mr-2" />
                 Leveranciers
             </Button>
             <Button variant="outline" onClick={() => router.push(`/dashboard/org/${org.id}/board-report`)}>
                 <Download className="w-4 h-4 mr-2" />
                 Rapport
             </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Scores & Roadmap */}
        <div className="lg:col-span-2 space-y-8">
            {/* Overall Score Card */}
            <Card className="bg-white">
                <CardContent className="flex items-center justify-between py-8">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Algemene NIS2-maturiteit</h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                            0–100: hoe hoger de score, hoe beter de NIS2-maturiteit.
                            Onder 60 betekent verhoogd risico en directe aandacht nodig.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className={cn("text-5xl font-bold mb-1",
                            latestScore?.overall_score && latestScore.overall_score >= 75 ? "text-green-600" :
                            latestScore?.overall_score && latestScore.overall_score >= 50 ? "text-yellow-600" : "text-red-600"
                        )}>
                            {latestScore?.overall_score ?? 0}%
                        </div>
                        <Badge color={overallColor}>{overallRisk}</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Category Grid */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scores per categorie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                         { title: 'Governance & organisatie', score: latestScore?.governance_score, desc: 'In hoeverre zijn rollen, verantwoordelijkheden en beleid rond NIS2 formeel vastgelegd en geborgd in de organisatie?' },
                         { title: 'Risicomanagement', score: latestScore?.risk_management_score, desc: 'Hoe systematisch worden digitale risico’s in kaart gebracht, beoordeeld en periodiek herzien?' },
                         { title: 'Incidentrespons & monitoring', score: latestScore?.incident_score, desc: 'Hoe goed is de MSP voorbereid op security-incidenten, inclusief detectie, logging en responscapaciteit?' },
                         { title: 'Leveranciers & keten', score: latestScore?.suppliers_score, desc: 'In hoeverre zijn afspraken, contracten en controles op NIS2-risico’s in de keten ingericht?' }
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
            </div>

            {/* Roadmap Phases Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aanpak in fases: 30 dagen, 3–6 maanden en 6–12 maanden</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader title="Binnen 30 dagen" subtitle="Quick wins & grootste gaten" />
                        <CardContent className="pt-2 text-sm text-gray-600">
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Urgent gaten dichten (MFA, backups).</li>
                                <li>Incidentprocedure opstellen.</li>
                                <li>Basis awareness sessie.</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader title="3–6 maanden" subtitle="Kernprocessen op orde" />
                        <CardContent className="pt-2 text-sm text-gray-600">
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Formeel risicomanagement proces.</li>
                                <li>Leverancierscontracten herzien.</li>
                                <li>Security rollen formaliseren.</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader title="6–12 maanden" subtitle="Richting audit-klaar niveau" />
                        <CardContent className="pt-2 text-sm text-gray-600">
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Periodieke rapportage & audit.</li>
                                <li>Volledige ketenbeheersing.</li>
                                <li>Continue verbetercyclus.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader title="NIS2 Categorie Scores" />
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
                <Card className="bg-gradient-to-br from-brand-primary to-sky-700 text-white border-none shadow-lg">
                    <CardContent className="py-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Volgende stap: NIS2-roadmap-sessie
                        </h3>
                        <p className="text-sky-100 mb-4 text-sm leading-relaxed">
                            Op basis van deze analyse bepalen we samen de eerstvolgende stappen:
                            welke maatregelen binnen 30 dagen, 3–6 maanden en 6–12 maanden nodig zijn om de NIS2-risico’s te verlagen.
                        </p>
                        <p className="text-sky-100 mb-6 text-sm leading-relaxed">
                            In een roadmap-sessie vertalen we dit dashboard naar een concreet actieplan, afgestemd op uw MSP, klantenportfolio en budget.
                        </p>
                        <Button
                            className="w-full bg-white text-brand-primary hover:bg-gray-100 border-none font-semibold text-base py-3"
                            onClick={handleRoadmapSession}
                        >
                            Plan een NIS2-roadmap-sessie
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Actions List */}
            <Card>
                <CardHeader title="Verbeteracties" subtitle="Geprioriteerde taken" />
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
                                    <option value="in_progress">Mee bezig</option>
                                    <option value="done">Gereed</option>
                                </select>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{action.title}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500 capitalize">{action.category.replace('_', ' ')}</span>
                                <Badge color={action.status === 'done' ? 'green' : action.status === 'in_progress' ? 'yellow' : 'gray'} className="text-[10px] px-1.5 py-0.5">
                                    {action.status.replace('_', ' ').replace('in progress', 'mee bezig')}
                                </Badge>
                            </div>
                        </div>
                    )) : (
                        <div className="p-6 text-center text-sm text-gray-500">
                            Geen openstaande acties.
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <button className="text-sm text-brand-primary font-medium hover:text-sky-700 flex items-center justify-center w-full">
                        Bekijk alle acties <ArrowUpRight className="w-3 h-3 ml-1" />
                    </button>
                </div>
            </Card>
        </div>
      </div>

      {showWizard && <IncidentWizard organisationId={id as string} onClose={() => setShowWizard(false)} onSuccess={handleWizardSuccess} />}
    </div>
  );
}
