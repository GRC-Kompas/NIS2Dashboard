'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TrendChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="text-gray-400 text-sm p-4">Geen trenddata beschikbaar</div>;

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fontSize: 10}} />
                    <YAxis domain={[0, 100]} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#01689B" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
