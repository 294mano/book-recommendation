// Google Sheets API endpoint
const SHEET_ID = '1234567890'; // 替换为您的 Google Sheets ID
const SHEET_NAME = 'Books'; // 替换为您的工作表名称
const API_KEY = 'YOUR_API_KEY'; // 替换为您的 Google Sheets API key

export interface SheetBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  rating: number;
  genre: string;
}

export const fetchBooks = async (): Promise<SheetBook[]> => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const data = await response.json();
  const rows = data.values.slice(1); // Skip header row

  return rows.map((row: any[], index: number) => ({
    id: index + 1,
    title: row[0] || '',
    author: row[1] || '',
    description: row[2] || '',
    coverUrl: row[3] || 'https://picsum.photos/seed/default/300/450',
    rating: parseFloat(row[4]) || 0,
    genre: row[5] || '',
  }));
};