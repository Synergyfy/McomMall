/**
 * Exports data to a CSV file and triggers a browser download.
 * @param data Array of objects to export
 * @param filename Desired filename (without extension)
 */
export function exportToCSV(data: any[], filename: string) {
    if (!data || !data.length) {
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvRows = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header] ?? '';
                    const escaped = String(value).replace(/"/g, '""'); // Escape double quotes
                    return `"${escaped}"`; // Wrap in quotes to handle commas
                })
                .join(',')
        ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
