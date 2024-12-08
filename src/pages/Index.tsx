import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { BookDialog } from "@/components/BookDialog";
import { Book } from "@/types/book";
import { useQuery } from "@tanstack/react-query";
import { fetchBooks } from "@/lib/googleSheets";
import { useToast } from "@/components/ui/use-toast";

// Updated Sheet ID from the published URL
const SHEET_ID = "2PACX-1vQACDPYIBHtZ8rWxiFYS-TYwQtEvKUtVtWIK97fN433c5RXGZ7cxnlGYG-5W8iEjA";

const Index = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', SHEET_ID],
    queryFn: () => fetchBooks(SHEET_ID),
    meta: {
      onError: (error: Error) => {
        toast({
          title: "错误",
          description: error.message || "获取书籍数据失败，请稍后再试",
          variant: "destructive",
        });
      },
    },
  });

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12">
      <div className="container">
        <h1 className="font-merriweather text-4xl font-bold text-blue-600 text-center mb-2">
          2025 AI精選應用書籍及工具索引
        </h1>
        <h2 className="font-merriweather text-xl text-red-600 text-center mb-8">
          國家公益發展協進會示範
        </h2>

        {isLoading && (
          <div className="text-center text-xl">加载中...</div>
        )}

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