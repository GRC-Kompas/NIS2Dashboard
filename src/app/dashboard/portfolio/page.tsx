'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, cn } from '@/components/ui';
import { getRiskLevel, getRiskColor } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Organisation {
  id: string;
  name: string;
  nis2_segment: string;
  overall_score: number | null;
  updated_at: string;
}

export default function PortfolioPage() {
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/organisations')
      .then((res) => {
        if (res.status === 401) {
            router.push('/login');
            throw new Error('Unauthorized');
        }
        if (res.status === 403) {
            setError('Access denied. You might not be a consultant.');
            setLoading(false);
            throw new Error('Forbidden');
        }
        return res.json();
      })
      .then((data) => {
        setOrgs(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [router]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading portfolio...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">NIS2-portfolio van MSP-klanten</h1>
        <p className="text-sm text-gray-500">
            Dit overzicht laat in één oogopslag zien welke MSP-klanten het meeste NIS2-risico lopen.
            De score is gebaseerd op de NIS2 Quickscan (governance, risicomanagement, incidentrespons en leveranciers).
        </p>
      </div>

      <Card className="border-t-4 border-t-brand-primary">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organisatie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risiconiveau
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIS2-score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laatste beoordeling
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Bekijk</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orgs.map((org) => {
                const riskLevel = getRiskLevel(org.overall_score);
                const riskColor = getRiskColor(riskLevel);

                return (
                    <tr
                        key={org.id}
                        className="group hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/dashboard/org/${org.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{org.name}</span>
                            <span className="text-xs text-gray-500">Segment: {org.nis2_segment || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={riskColor}>{riskLevel}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {org.overall_score !== null ? (
                             <div className="flex items-center space-x-2">
                                <span className={cn(
                                    "text-sm font-bold w-8 text-right",
                                    org.overall_score >= 75 ? "text-green-700" :
                                    org.overall_score >= 50 ? "text-yellow-700" : "text-red-700"
                                )}>
                                    {org.overall_score}%
                                </span>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full",
                                            org.overall_score >= 75 ? "bg-green-500" :
                                            org.overall_score >= 50 ? "bg-yellow-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${org.overall_score}%` }}
                                    ></div>
                                </div>
                             </div>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Geen score</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(org.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-brand-primary transition-colors ml-auto" />
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
