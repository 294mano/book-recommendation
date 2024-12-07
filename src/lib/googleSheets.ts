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
  
  // 改進CSV解析邏輯，使用更嚴格的過濾條件
  const rows = text.split('\n')
    .map(row => {
      const matches = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim()) : null;
    })
    .filter((row): row is string[] => {
      return row !== null && 
             row[0]?.trim() !== '' && // 標題不為空
             row[0]?.trim() !== 'Title' && // 不是標題行
             !row[0]?.trim().startsWith(','); // 不是錯誤格式的行
    });
  
  console.log('Filtered rows:', rows);
  
  // 使用 Set 來去除重複的標題
  const uniqueBooks = new Map<string, SheetBook>();
  
  rows.forEach((row, index) => {
    const title = row[0]?.trim();
    if (title && !uniqueBooks.has(title)) {
      uniqueBooks.set(title, {
        id: uniqueBooks.size + 1,
        title,
        author: row[1]?.trim() || '',
        description: row[2]?.trim() || '',
        coverUrl: convertGoogleDriveUrl(row[3]?.trim() || ''),
        rating: parseFloat(row[4]) || 0,
        sourceUrl: row[5]?.trim() || '#',
      });
    }
  });

  const books = Array.from(uniqueBooks.values());
  console.log('Processed books:', books);
  return books;
};