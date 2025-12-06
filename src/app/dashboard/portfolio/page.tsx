'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, Badge } from '@/components/ui';

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
        // Error handled in state if needed, mostly for 403
      });
  }, [router]);

  if (loading) return <div className="p-4">Loading portfolio...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of all managed organisations and their NIS2 compliance status.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organisation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color="gray">{org.nis2_segment}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.overall_score !== null ? (
                         <div className="flex items-center">
                            <span className={cn(
                                "text-sm font-bold",
                                org.overall_score >= 80 ? "text-green-600" :
                                org.overall_score >= 50 ? "text-yellow-600" : "text-red-600"
                            )}>
                                {org.overall_score}%
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div
                                    className={cn("h-2 rounded-full",
                                        org.overall_score >= 80 ? "bg-green-500" :
                                        org.overall_score >= 50 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${org.overall_score}%` }}
                                ></div>
                            </div>
                         </div>
                    ) : (
                        <span className="text-sm text-gray-500">No data</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(org.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/org/${org.id}`} className="text-blue-600 hover:text-blue-900">
                      View Details
                    </Link>
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

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
