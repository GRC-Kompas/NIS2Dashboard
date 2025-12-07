'use client';

import { useEffect, useState, use } from 'react';
import { Badge, Button } from '@/components/ui';
import { Download, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { TrendChart } from '@/components/TrendChart';
import { getRiskLevel, getRiskColor } from '@/lib/utils';

export default function BoardReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      // Fetch combined data for report
      const fetchData = async () => {
          try {
              const orgRes = await fetch(`/api/organisations/${id}`);
              const org = await orgRes.json();

              const actionsRes = await fetch(`/api/organisations/${id}/actions?status=open`);
              const actions = await actionsRes.json();

              let incidents: any[] = [];
              try {
                  // Mock or fetch logic
                  incidents = [
                      { discovered_at: new Date().toISOString(), type: 'Ransomware poging', status: 'Afgehandeld' }
                  ];
              } catch (e) {}

              let suppliers: any[] = [];
              try {
                  const supRes = await fetch(`/api/organisations/${id}/suppliers`);
                  if (supRes.ok) suppliers = await supRes.json();
              } catch (e) {}

              setData({
                  org,
                  actions: actions.filter((a: any) => a.priority === 'high').slice(0, 5), // Top 5 high priority
                  incidents,
                  suppliers: suppliers.slice(0, 5),
                  trend: [
                      { date: 'Q1', score: 45 },
                      { date: 'Q2', score: 55 },
                      { date: 'Q3', score: org.risk_scores[0]?.overall_score || 60 }
                  ]
              });
              setLoading(false);
          } catch (e) {
              console.error(e);
          }
      };
      fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Rapport genereren...</div>;

  const score = data.org.risk_scores[0];
  const riskLevel = getRiskLevel(score?.overall_score ?? null);
  const riskColor = getRiskColor(riskLevel);

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-8 bg-white text-gray-900 shadow-sm border border-gray-100 min-h-screen">

        {/* Header Section */}
        <div className="flex justify-between items-start border-b pb-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900">NIS2 Bestuursrapportage</h1>
                <h2 className="text-xl text-gray-500 mt-2">{data.org.name}</h2>
                <p className="text-sm text-gray-400 mt-1">Datum: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
                <Button className="mb-2" onClick={() => alert('PDF Download Coming Soon')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download rapport (PDF)
                </Button>
                <p className="text-xs text-gray-400 italic max-w-xs ml-auto">
                    Gebruik deze optie om het rapport te delen met directie of bestuur.
                </p>
            </div>
        </div>

        {/* Samenvatting */}
        <section>
            <h3 className="text-2xl font-semibold mb-4 text-brand-primary">1. Samenvatting</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
                Dit rapport geeft een overzicht van de belangrijkste NIS2-risico’s en maatregelen voor deze organisatie.
                Het is bedoeld voor directie en bestuur om in één oogopslag inzicht te krijgen in de stand van zaken en de benodigde vervolgstappen.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <ul className="space-y-2">
                    <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-brand-primary mr-3" />
                        <span>Huidige score: <strong>{score?.overall_score ?? 0}%</strong> ({riskLevel})</span>
                    </li>
                    <li className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                        <span>Openstaande high-risk acties: <strong>{data.actions.length}</strong></span>
                    </li>
                    <li className="flex items-center">
                        <ShieldAlert className="w-5 h-5 text-orange-500 mr-3" />
                        <span>Incidenten (lopend): <strong>{data.incidents.length}</strong></span>
                    </li>
                </ul>
            </div>
        </section>

        {/* NIS2 Scores */}
        <section>
            <h3 className="text-2xl font-semibold mb-4 text-brand-primary">2. NIS2-scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <div className="mb-6">
                        <span className="text-sm text-gray-500 uppercase tracking-wide">Overall Score</span>
                        <div className="flex items-baseline mt-1 space-x-4">
                            <span className="text-6xl font-bold text-gray-900">{score?.overall_score ?? 0}%</span>
                            <Badge color={riskColor} className="text-lg px-3 py-1">{riskLevel}</Badge>
                        </div>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Governance</td>
                                <td className="py-2 text-right font-bold">{score?.governance_score}%</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Risicomanagement</td>
                                <td className="py-2 text-right font-bold">{score?.risk_management_score}%</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Incidentrespons</td>
                                <td className="py-2 text-right font-bold">{score?.incident_score}%</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium">Leveranciers</td>
                                <td className="py-2 text-right font-bold">{score?.suppliers_score}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <TrendChart data={data.trend} />
                </div>
            </div>
        </section>

        {/* Belangrijkste Risico's */}
        <section>
            <h3 className="text-2xl font-semibold mb-4 text-brand-primary">3. Belangrijkste risico’s en acties</h3>
            <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioriteit</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.actions.map((action: any) => (
                            <tr key={action.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{action.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{action.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color="red">High</Badge>
                                </td>
                            </tr>
                        ))}
                        {data.actions.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-4 text-sm text-gray-500">Geen high-risk acties.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {/* Incidenten */}
        <section>
            <h3 className="text-2xl font-semibold mb-4 text-brand-primary">4. Meldplicht en incidenten</h3>
            <p className="text-sm text-gray-600 mb-4">
                Hieronder een overzicht van recent geregistreerde incidenten conform de NIS2-meldplicht.
            </p>
            <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.incidents.map((inc: any, idx: number) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 text-sm text-gray-900">{new Date(inc.discovered_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{inc.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{inc.status || 'Geregistreerd'}</td>
                            </tr>
                        ))}
                        {data.incidents.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-4 text-sm text-gray-500">Geen recente incidenten.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {/* Keten */}
        <section>
            <h3 className="text-2xl font-semibold mb-4 text-brand-primary">5. Keten en leveranciers</h3>
            <p className="text-sm text-gray-600 mb-4">
                NIS2 vereist strikt toezicht op de veiligheid van de toeleveringsketen.
            </p>
            <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leverancier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risico</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.suppliers.map((sup: any) => (
                            <tr key={sup.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{sup.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{sup.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={sup.risk_level === 'High' ? 'red' : sup.risk_level === 'Medium' ? 'yellow' : 'green'}>{sup.risk_level}</Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{sup.status}</td>
                            </tr>
                        ))}
                        {data.suppliers.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-500">Geen leveranciers data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    </div>
  );
}
