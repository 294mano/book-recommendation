import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Book } from "@/types/book";
import { Star, ExternalLink } from "lucide-react";

interface BookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookDialog = ({ book, open, onOpenChange }: BookDialogProps) => {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-merriweather text-2xl mb-4">
            {book.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[2/3] overflow-hidden rounded-lg">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="mb-4">
              <h4 className="font-semibold mb-1">作者</h4>
              <p className="text-gray-600">{book.author}</p>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-1">评分</h4>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
                <span>{book.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-1">来源链接</h4>
              <a 
                href={book.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                访问来源 <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-1">简介</h4>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};