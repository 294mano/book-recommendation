// Google Sheets API endpoint
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || ''; // Add your Sheet ID to .env
const SHEET_NAME = 'Books';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''; // Add your API key to .env

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
  if (!SHEET_ID || !API_KEY) {
    throw new Error('Missing Google Sheets configuration');
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
  );
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch books');
  }

  const data = await response.json();
  const rows = data.values?.slice(1) || []; // Skip header row

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