import { Book } from "@/types/book";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

export const BookCard = ({ book, onClick }: BookCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg animate-fade-up"
      onClick={() => onClick(book)}
    >
      <CardContent className="p-4">
        <div className="aspect-[2/3] overflow-hidden rounded-md mb-4">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="font-merriweather text-lg font-semibold line-clamp-1 mb-1">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
          <span className="text-sm">{book.rating.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
};