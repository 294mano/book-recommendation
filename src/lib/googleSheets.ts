export interface SheetBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  rating: number;
  sourceUrl: string;
}

// Helper function to convert Google Drive URL to direct image URL
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return 'https://picsum.photos/seed/default/300/450';
  
  // Check if it's a Google Drive URL
  if (url.includes('drive.google.com/file/d/')) {
    // Extract the file ID
    const fileId = url.match(/\/d\/(.+?)\//)?.[1];
    if (fileId) {
      // Return the direct download URL
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return url;
};

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
  console.log('Raw CSV data:', text);
  
  // Parse CSV data, skipping the header row
  const rows = text.split('\n')
    .map(row => {
      // Handle quoted values correctly
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!matches) return null;
      return matches.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
    })
    .filter((row): row is string[] => row !== null); // Type guard to filter out null values
  
  // Remove header row and empty rows
  const dataRows = rows.slice(1).filter(row => row.length >= 6);
  
  // Create unique books array
  const uniqueBooks = dataRows.reduce((acc: SheetBook[], row) => {
    const title = row[0]?.trim();
    // Skip if we already have this book or if required fields are missing
    if (!title || acc.some(book => book.title === title)) {
      return acc;
    }
    
    acc.push({
      id: acc.length + 1,
      title: title,
      author: row[1]?.trim() || '',
      description: row[2]?.trim() || '',
      coverUrl: convertGoogleDriveUrl(row[3]?.trim() || ''),
      rating: parseFloat(row[4]) || 0,
      sourceUrl: row[5]?.trim() || '#',
    });
    return acc;
  }, []);

  console.log('Processed books:', uniqueBooks);
  return uniqueBooks;
};