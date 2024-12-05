import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface GoogleSheetInputProps {
  onSheetIdSubmit: (sheetId: string) => void;
}

export const GoogleSheetInput = ({ onSheetIdSubmit }: GoogleSheetInputProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const extractSheetId = (url: string) => {
    try {
      const matches = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sheetId = extractSheetId(url);
    
    if (!sheetId) {
      toast({
        title: "错误",
        description: "请输入有效的 Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    onSheetIdSubmit(sheetId);
    toast({
      title: "成功",
      description: "Google Sheets 已连接",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="url"
          placeholder="输入 Google Sheets URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">连接</Button>
      </div>
      <p className="text-sm text-gray-500 text-center">
        提示：请确保您的 Google Sheet 已设置为"任何人都可以查看"
      </p>
    </form>
  );
};