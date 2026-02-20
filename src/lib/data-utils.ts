export function jsonToCsv(json: string): string {
  try {
    const items = JSON.parse(json);
    if (!Array.isArray(items) || items.length === 0) return '';
    
    // Handle nested data if using generic records
    const processedItems = items.map(item => {
      if (item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
        return { id: item.id, ...item.data };
      }
      return item;
    });

    const replacer = (key: string, value: any) => (value === null ? '' : value);
    const header = Object.keys(processedItems[0]);
    const csv = [
      header.join(','),
      ...processedItems.map((row: any) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      ),
    ].join('\r\n');

    return csv;
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    return '';
  }
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}