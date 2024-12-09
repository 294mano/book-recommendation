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
  
  // 清理 URL，移除所有空白字符和换行符
  const cleanUrl = url.replace(/[\s\n\r]+/g, '').trim();
  
  // 检查是否已经是缩略图URL
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

const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 处理双引号转义
        field += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段结束
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  
  // 添加最后一个字段
  fields.push(field.trim());
  return fields;
}

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
  
  // 分割行并移除表头
  const lines = text.split('\n').slice(1);
  
  // 使用 Map 存储唯一的书籍
  const uniqueBooks = new Map<string, SheetBook>();
  
  lines.forEach((line, index) => {
    if (!line.trim()) return; // 跳过空行
    
    const fields = parseCSVLine(line);
    const [title, author, description, coverUrl, rating, sourceUrl] = fields;
    
    // 只处理有标题的行
    if (title && !title.toLowerCase().includes('title')) {
      // 解析评分
      let parsedRating = 0;
      const cleanRating = rating ? rating.replace(/[\s\n\r]+/g, '').trim() : '';
      
      if (cleanRating) {
        const ratingValue = parseFloat(cleanRating);
        if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 5) {
          parsedRating = ratingValue;
        }
      }
      
      // 清理 sourceUrl
      const cleanSourceUrl = sourceUrl ? sourceUrl.replace(/[\s\n\r]+/g, '').trim() : '';
      
      uniqueBooks.set(title, {
        id: uniqueBooks.size + 1,
        title: title.trim(),
        author: author?.trim() || '',
        description: description?.trim() || '',
        coverUrl: convertGoogleDriveUrl(coverUrl?.trim() || ''),
        rating: parsedRating,
        sourceUrl: cleanSourceUrl || '#',
      });
    }
  });

  const books = Array.from(uniqueBooks.values());
  console.log('Processed books:', books);
  return books;
};