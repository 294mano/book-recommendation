export interface SheetBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  rating: number;
  sourceUrl: string;
}

const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return 'https://picsum.photos/seed/default/300/450';
  
  const cleanUrl = url.replace(/[\s\n\r]+/g, '').trim();
  
  if (cleanUrl.includes('thumbnail?id=')) {
    return cleanUrl;
  }
  
  const fileIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  return url;
};

export const fetchBooks = async (sheetId: string): Promise<SheetBook[]> => {
  if (!sheetId) {
    throw new Error('Missing Sheet ID');
  }

  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const text = await response.text();
  console.log('Raw CSV data:', text);
  
  // Split into lines and remove header
  const lines = text.split('\n').slice(1);
  const books: SheetBook[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line handling quoted fields properly
    let fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          // Handle escaped quotes
          currentField += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    
    // Remove quotes from fields
    fields = fields.map(field => field.replace(/^"|"$/g, '').replace(/""/g, '"'));
    
    const [title, author, description, coverUrl, rating, sourceUrl] = fields;
    
    if (title && !title.toLowerCase().includes('title')) {
      // Parse rating - handle both integer and decimal values
      let parsedRating = 0;
      if (rating) {
        const cleanRating = rating.trim().replace(/[^\d.]/g, '');
        const ratingNum = parseFloat(cleanRating);
        if (!isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= 5) {
          parsedRating = ratingNum;
        }
      }
      
      // Clean source URL - preserve the original URL without modification
      const cleanSourceUrl = sourceUrl ? sourceUrl.trim() : '#';
      
      books.push({
        id: books.length + 1,
        title: title.trim(),
        author: author?.trim() || '',
        description: description?.trim() || '',
        coverUrl: convertGoogleDriveUrl(coverUrl?.trim() || ''),
        rating: parsedRating,
        sourceUrl: cleanSourceUrl === '' ? '#' : cleanSourceUrl,
      });
    }
  }

  console.log('Processed books:', books);
  return books;
};