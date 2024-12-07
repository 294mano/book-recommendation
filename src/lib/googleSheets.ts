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
  
  // Check if it's a Google Drive URL and extract the file ID
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    console.log('Extracted file ID:', fileId);
    // Return the direct download URL with additional parameters for better caching and access
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  console.log('URL not converted:', url);
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
  
  // Parse CSV data, handling quoted values and newlines properly
  const rows = text.split('\n')
    .map(row => {
      // Handle quoted values correctly
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!matches) return null;
      return matches.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
    })
    .filter((row): row is string[] => row !== null && row.length >= 6); // Type guard and ensure minimum columns
  
  // Remove header row
  const dataRows = rows.slice(1);
  
  // Map rows to books, ensuring unique entries by title
  const booksMap = new Map<string, SheetBook>();
  
  dataRows.forEach((row, index) => {
    const title = row[0]?.trim();
    if (title && !booksMap.has(title)) {
      const coverUrl = convertGoogleDriveUrl(row[3]?.trim() || '');
      console.log(`Processing book ${index + 1}:`, {
        title,
        coverUrl: row[3]?.trim(),
        convertedUrl: coverUrl
      });
      
      booksMap.set(title, {
        id: index + 1,
        title,
        author: row[1]?.trim() || '',
        description: row[2]?.trim() || '',
        coverUrl,
        rating: parseFloat(row[4]) || 0,
        sourceUrl: row[5]?.trim() || '#',
      });
    }
  });

  const books = Array.from(booksMap.values());
  console.log('Processed books:', books);
  return books;
};