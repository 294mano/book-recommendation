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
  
  // 清理 URL 中的多余空格和换行符
  const cleanUrl = url.replace(/\s+/g, '').trim();
  
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
  
  // 改進CSV解析邏輯
  const rows = text.split('\n')
    .map(row => {
      // 使用更精確的CSV解析
      const matches = row.match(/(".*?"|[^",\n]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(cell => {
        // 清理单元格数据
        return cell
          .replace(/^"|"$/g, '') // 移除引号
          .replace(/""/g, '"') // 处理双引号
          .trim(); // 移除空格
      }) : null;
    })
    .filter((row): row is string[] => {
      return row !== null && 
             row[0]?.trim() !== '' && // 标题不为空
             row[0]?.trim().toLowerCase() !== 'title' && // 不是标题行
             !row[0]?.trim().startsWith(','); // 不是错误格式的行
    });
  
  console.log('Filtered rows:', rows);
  
  // 使用 Map 來去除重複的標題，並保持插入順序
  const uniqueBooks = new Map<string, SheetBook>();
  
  rows.forEach((row) => {
    const title = row[0]?.trim();
    // 只处理有标题的行
    if (title) {
      // 确保评分正确解析
      const rating = row[4] ? parseFloat(row[4].trim()) : 0;
      
      uniqueBooks.set(title, {
        id: uniqueBooks.size + 1,
        title,
        author: row[1]?.trim() || '',
        description: row[2]?.trim() || '',
        coverUrl: convertGoogleDriveUrl(row[3]?.trim() || ''),
        rating: isNaN(rating) ? 0 : rating,
        sourceUrl: row[5]?.trim() || '#',
      });
    }
  });

  const books = Array.from(uniqueBooks.values());
  console.log('Processed books:', books);
  return books;
};