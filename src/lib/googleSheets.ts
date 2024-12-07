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
  
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
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
  
  // 改进CSV解析逻辑
  const rows = text.split('\n')
    .map(row => {
      const matches = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim()) : null;
    })
    .filter((row): row is string[] => row !== null);
  
  // 移除标题行
  const dataRows = rows.slice(1);
  console.log('Data rows:', dataRows);
  
  const books: SheetBook[] = dataRows.map((row, index) => {
    const coverUrl = convertGoogleDriveUrl(row[3]?.trim() || '');
    return {
      id: index + 1,
      title: row[0]?.trim() || '',
      author: row[1]?.trim() || '',
      description: row[2]?.trim() || '',
      coverUrl,
      rating: parseFloat(row[4]) || 0,
      sourceUrl: row[5]?.trim() || '#',
    };
  });

  console.log('Processed books:', books);
  return books;
};