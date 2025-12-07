'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { TrendChart } from '@/components/TrendChart';
import { getRiskLevel, getRiskColor } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, Activity, Users, AlertTriangle } from 'lucide-react';

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      overallScore: 0,
      kpis: {
          highRiskActions: 5,
          openIncidents: 1,
          avgSupplierRisk: 'Middelgroot'
      },
      categories: {
          governance: 0,
          risk: 0,
          incident: 0,
          supply: 0
      },
      trend: [] as any[],
      topRisks: [] as any[]
  });

  useEffect(() => {
      // Mock data for Demo - aligned with Seeded data
      // MSP Alpha has score 40, 1 Incident, High Risk actions.
      // MSP Bravo has score 70.
      // Average score approx (40+70)/2 = 55. Let's use 64 as requested example or 55.

      setTimeout(() => {
          setStats({
              overallScore: 64,
              kpis: {
                  highRiskActions: 3, // MSP Alpha has 2, Bravo 0?
                  openIncidents: 1, // MSP Alpha has 1
                  avgSupplierRisk: 'Middelgroot'
              },
              categories: {
                  governance: 60,
                  risk: 50,
                  incident: 60,
                  supply: 50
              },
              trend: [
                  { date: 'Jan', score: 55 },
                  { date: 'Feb', score: 58 },
                  { date: 'Mar', score: 62 },
                  { date: 'Apr', score: 64 }
              ],
              topRisks: [
                  { name: 'MSP Alpha', score: 40, risk: 'Hoog risico' },
                  { name: 'MSP Bravo', score: 70, risk: 'Middelgroot risico' }
              ]
          });
          setLoading(false);
      }, 500);
  }, []);

  if (loading) return <div className="p-8">Laden...</div>;

  const riskLevel = getRiskLevel(stats.overallScore);
  const riskColor = getRiskColor(riskLevel);

  return (
    <div className="space-y-8">
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900">NIS2-dashboard voor MSP’s</h1>
            <p className="mt-2 text-gray-600">
                Dit overzicht laat in één oogopslag zien waar de grootste NIS2-risico’s liggen.
                Managers zien direct: ben ik veilig, en waar moet ik als eerste ingrijpen?
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Primary "Am I Safe?" Tile */}
            <Card className="md:col-span-1 bg-white border-t-4 border-t-brand-primary shadow-lg">
                <CardHeader title="Algemene NIS2-gereedheid" />
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="text-6xl font-extrabold text-brand-primary my-2">{stats.overallScore}%</div>
                    <Badge color={riskColor} className="text-base px-4 py-1 mb-4">{riskLevel}</Badge>
                    <p className="text-sm text-gray-500 text-center">
                        Dit geeft in één oogopslag weer hoe volwassen de NIS2-aanpak is.
                    </p>
                </CardContent>
            </Card>

            {/* KPI Cards & Top Risks */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* KPI 1 */}
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Open high-risk acties</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.kpis.highRiskActions}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* KPI 2 */}
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Open incidenten (90d)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.kpis.openIncidents}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <ShieldAlert className="w-6 h-6 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Top Risky Clients */}
                <Card className="sm:col-span-2">
                    <CardHeader title="Top risicovolle klanten" />
                    <CardContent className="py-2 px-0">
                        <ul className="divide-y divide-gray-100">
                            {stats.topRisks.map((client, idx) => (
                                <li key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                                    <span className="font-medium text-gray-900">{client.name}</span>
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-gray-700">{client.score}%</span>
                                        <Badge color={client.risk === 'Hoog risico' ? 'red' : 'yellow'}>{client.risk}</Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Traffic Light Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Governance', score: stats.categories.governance, icon: ShieldCheck },
                { label: 'Risicomanagement', score: stats.categories.risk, icon: Activity },
                { label: 'Incidentrespons', score: stats.categories.incident, icon: ShieldAlert },
                { label: 'Leveranciers', score: stats.categories.supply, icon: Users }
            ].map(cat => (
                <Card key={cat.label}>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="p-2 bg-gray-50 rounded-lg mb-3">
                            <cat.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">{cat.label}</h3>
                        <div className="text-xl font-bold text-gray-900 mb-2">{cat.score}%</div>
                        <Badge color={getRiskColor(getRiskLevel(cat.score))} className="text-[10px]">{getRiskLevel(cat.score)}</Badge>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Trend Section */}
        <Card>
            <CardHeader title="Ontwikkeling NIS2-score in de tijd" />
            <CardContent>
                <TrendChart data={stats.trend} />
            </CardContent>
        </Card>
    </div>
  );
}
