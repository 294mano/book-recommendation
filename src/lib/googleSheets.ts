export interface SheetBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  rating: number;
  sourceUrl: string;
}

export const fetchBooks = async (sheetId: string): Promise<SheetBook[]> => {
  if (!sheetId) {
    throw new Error('Missing Sheet ID');
  }

  // Use the public CSV export URL
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const text = await response.text();
  console.log('Fetched data:', text); // Debug log
  
  // Parse CSV data
  const rows = text.split('\n').map(row => {
    // Handle quoted values correctly
    return row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(cell => {
      // Remove quotes if present
      return cell.replace(/^"|"$/g, '').replace('""', '"');
    }) || [];
  });

  // Remove header row and empty rows
  const dataRows = rows.slice(1).filter(row => row.length > 0);
  
  return dataRows.map((row, index) => ({
    id: index + 1,
    title: row[0] || '',
    author: row[1] || '',
    description: row[2] || '',
    coverUrl: row[3] || 'https://picsum.photos/seed/default/300/450',
    rating: parseFloat(row[4]) || 0,
    sourceUrl: row[5] || '#',
  }));
};