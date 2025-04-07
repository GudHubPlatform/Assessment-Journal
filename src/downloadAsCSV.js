export function downloadAsCSV(data, filename = "report.csv") {
    const csvRows = data.map(row =>
        row.map(cell => {
            const value = typeof cell === 'object' && cell !== null ? cell.value : cell;
            const safeValue = String(value).replace(/"/g, '""'); // escape quotes
            return `"${safeValue}"`;
        }).join(',')
    );

    const csvContent = csvRows.join('\n');

    // Створюємо blob і тригеримо завантаження
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}