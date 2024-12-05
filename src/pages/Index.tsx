import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { BookDialog } from "@/components/BookDialog";
import { Book } from "@/types/book";
import { useQuery } from "@tanstack/react-query";
import { fetchBooks } from "@/lib/googleSheets";
import { useToast } from "@/components/ui/use-toast";
import { GoogleSheetInput } from "@/components/GoogleSheetInput";

const Index = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetId, setSheetId] = useState<string>("");
  const { toast } = useToast();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', sheetId],
    queryFn: () => fetchBooks(sheetId),
    enabled: !!sheetId,
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
        <h1 className="font-merriweather text-4xl font-bold text-center mb-8">
          精选书籍推荐
        </h1>
        
        <GoogleSheetInput onSheetIdSubmit={setSheetId} />

        {!sheetId && (
          <div className="text-center text-gray-600 mb-8">
            请输入 Google Sheets URL 以显示书籍列表
          </div>
        )}

        {isLoading && (
          <div className="text-center text-xl">加载中...</div>
        )}

        {sheetId && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={handleBookClick} />
            ))}
          </div>
        )}
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