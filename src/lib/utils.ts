export function getRiskLevel(score: number | null): 'Hoog risico' | 'Middelgroot risico' | 'Laag risico' | 'Onbekend' {
    if (score === null) return 'Onbekend';
    if (score < 50) return 'Hoog risico'; // 0-49
    if (score < 75) return 'Middelgroot risico'; // 50-74
    return 'Laag risico'; // 75-100
}

export function getRiskColor(level: 'Hoog risico' | 'Middelgroot risico' | 'Laag risico' | 'Onbekend'): 'red' | 'yellow' | 'green' | 'gray' {
    switch (level) {
        case 'Hoog risico': return 'red';
        case 'Middelgroot risico': return 'yellow';
        case 'Laag risico': return 'green';
        default: return 'gray';
    }
}
