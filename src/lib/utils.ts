export function getRiskLevel(score: number | null): 'High' | 'Medium' | 'Low' | 'Unknown' {
    if (score === null) return 'Unknown';
    if (score < 50) return 'High';
    if (score < 80) return 'Medium';
    return 'Low';
}

export function getRiskColor(level: 'High' | 'Medium' | 'Low' | 'Unknown'): 'red' | 'yellow' | 'green' | 'gray' {
    switch (level) {
        case 'High': return 'red';
        case 'Medium': return 'yellow';
        case 'Low': return 'green';
        default: return 'gray';
    }
}
