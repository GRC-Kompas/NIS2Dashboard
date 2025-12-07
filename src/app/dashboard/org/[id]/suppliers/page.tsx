'use client';

import { useEffect, useState, use } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Mail, CheckCircle } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  type: string;
  contact_email: string;
  risk_level: 'High' | 'Medium' | 'Low';
  status: 'Geen vragenlijst' | 'Vragenlijst verstuurd' | 'Beoordeeld';
}

export default function SuppliersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/organisations/${id}/suppliers`)
      .then(res => res.json())
      .then(data => {
          setSuppliers(data);
          setLoading(false);
      });
  }, [id]);

  const handleSendQuestionnaire = (supplierId: string) => {
      // Mock logic
      alert('NIS2 Vragenlijst verstuurd naar leverancier!');
      setSuppliers(suppliers.map(s => s.id === supplierId ? { ...s, status: 'Vragenlijst verstuurd' } : s));
  };

  if (loading) return <div>Laden...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Leveranciers & Ketenbeheer</h1>
        <p className="text-sm text-gray-500">Overzicht van kritieke leveranciers en hun NIS2-status.</p>
      </div>

      <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leverancier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risiconiveau</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actie</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map(supplier => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.type || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge color={supplier.risk_level === 'High' ? 'red' : supplier.risk_level === 'Medium' ? 'yellow' : 'green'}>
                                    {supplier.risk_level}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button size="sm" variant="outline" onClick={() => handleSendQuestionnaire(supplier.id)}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Stuur Vragenlijst
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {suppliers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Geen leveranciers gevonden.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}
