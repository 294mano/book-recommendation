export interface SheetBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  rating: number;
  genre: string;
}

export const fetchBooks = async (sheetId: string): Promise<SheetBook[]> => {
  if (!sheetId) {
    throw new Error('Missing Sheet ID');
  }

  // Use the public CSV export URL
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const text = await response.text();
  // Remove the garbage characters at the start and end of the response
  const jsonString = text.substring(47).slice(0, -2);
  const data = JSON.parse(jsonString);
  
  // Extract the column headers
  const headers = data.table.cols.map((col: any) => col.label);
  
  // Map the rows to our SheetBook interface
  return data.table.rows.map((row: any, index: number) => {
    const values = row.c.map((cell: any) => cell ? cell.v : '');
    const book: SheetBook = {
      id: index + 1,
      title: values[headers.indexOf('title')] || '',
      author: values[headers.indexOf('author')] || '',
      description: values[headers.indexOf('description')] || '',
      coverUrl: values[headers.indexOf('coverUrl')] || 'https://picsum.photos/seed/default/300/450',
      rating: parseFloat(values[headers.indexOf('rating')]) || 0,
      genre: values[headers.indexOf('genre')] || '',
    };
    return book;
  });
};