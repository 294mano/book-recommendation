import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { BookDialog } from "@/components/BookDialog";
import { Book } from "@/types/book";

// 示例数据
const books: Book[] = [
  {
    id: 1,
    title: "三体",
    author: "刘慈欣",
    description: "地球文明向宇宙发出的第一声啼鸣，以及它所引发的回声。",
    coverUrl: "https://picsum.photos/seed/book1/300/450",
    rating: 4.8,
    genre: "科幻",
  },
  {
    id: 2,
    title: "活着",
    author: "余华",
    description: "一个人一生的故事，一个家族的兴衰，一个时代的变迁。",
    coverUrl: "https://picsum.photos/seed/book2/300/450",
    rating: 4.9,
    genre: "当代文学",
  },
  {
    id: 3,
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    description: "布恩迪亚家族七代人的传奇故事，魔幻现实主义的经典之作。",
    coverUrl: "https://picsum.photos/seed/book3/300/450",
    rating: 4.7,
    genre: "魔幻现实主义",
  },
  {
    id: 4,
    title: "围城",
    author: "钱钟书",
    description: "一部关于婚姻与人生的讽刺小说，字字珠玑，妙趣横生。",
    coverUrl: "https://picsum.photos/seed/book4/300/450",
    rating: 4.6,
    genre: "现代文学",
  },
];

const Index = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12">
      <div className="container">
        <h1 className="font-merriweather text-4xl font-bold text-center mb-8">
          精选书籍推荐
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={handleBookClick} />
          ))}
        </div>
      </div>
      <BookDialog
        book={selectedBook}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default Index;