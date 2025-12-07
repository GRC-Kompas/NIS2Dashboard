'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, Button } from '@/components/ui';
import { X, Save } from 'lucide-react';

interface IncidentWizardProps {
  organisationId: string;
  onClose: () => void;
  onSuccess: (incident: any) => void;
}

export function IncidentWizard({ organisationId, onClose, onSuccess }: IncidentWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Ransomware',
    impact: '',
    discovered_at: new Date().toISOString().slice(0, 16),
    initial_actions: '',
    contact_name: '',
    contact_email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/organisations/${organisationId}/incidents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            const data = await res.json();
            onSuccess(data);
        } else {
            console.error('Failed to report incident');
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold">Meld NIS2 Incident</h2>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
                <span className={step >= 1 ? "text-brand-primary font-bold" : ""}>1. Type</span>
                <span className={step >= 2 ? "text-brand-primary font-bold" : ""}>2. Impact</span>
                <span className={step >= 3 ? "text-brand-primary font-bold" : ""}>3. Actie</span>
                <span className={step >= 4 ? "text-brand-primary font-bold" : ""}>4. Contact</span>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type Incident</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border">
                            <option>Ransomware</option>
                            <option>Datalek (Confidentiality)</option>
                            <option>DDoS (Availability)</option>
                            <option>Phishing / Compromised Account</option>
                            <option>Anders</option>
                        </select>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Impact Omschrijving</label>
                        <textarea name="impact" value={formData.impact} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" placeholder="Beschrijf getroffen systemen, data en geschat aantal klanten..."></textarea>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ontdekt op</label>
                        <input type="datetime-local" name="discovered_at" value={formData.discovered_at} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Eerste Maatregelen</label>
                        <textarea name="initial_actions" value={formData.initial_actions} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" placeholder="Wat is er al gedaan om het incident in te dammen?"></textarea>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Naam Melder</label>
                        <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border" />
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-between">
                {step > 1 ? (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>Vorige</Button>
                ) : (
                    <div></div>
                )}

                {step < 4 ? (
                    <Button onClick={() => setStep(step + 1)}>Volgende</Button>
                ) : (
                    <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? 'Verzenden...' : 'Melding Versturen'}
                    </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
