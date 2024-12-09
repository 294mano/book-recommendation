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
  
  // 分割行並移除表頭
  const lines = text.split('\n').slice(1);
  const books: SheetBook[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 使用正則表達式匹配CSV字段，處理引號內的內容
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
    const fields: string[] = [];
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      // 使用捕獲的帶引號或不帶引號的值
      const value = match[1] !== undefined 
        ? match[1].replace(/""/g, '"') // 處理雙引號轉義
        : match[2];
      fields.push(value ? value.trim() : '');
    }
    
    const [title, author, description, coverUrl, rating, sourceUrl] = fields;
    
    // 只處理有效的標題行（排除標題行和無效數據）
    if (title && !title.toLowerCase().includes('title') && !title.startsWith(',')) {
      // 解析評分
      let parsedRating = 0;
      if (rating) {
        const ratingNum = parseFloat(rating.replace(/[^\d.]/g, ''));
        if (!isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= 5) {
          parsedRating = ratingNum;
        }
      }
      
      // 清理 sourceUrl
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