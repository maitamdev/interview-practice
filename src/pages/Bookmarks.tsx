import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBookmarks, BookmarkedQuestion } from '@/hooks/useBookmarks';
import { ROLE_INFO, LEVEL_INFO } from '@/types/interview';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  Edit3, 
  Save,
  X,
  BookOpen,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Bookmarks() {
  const { bookmarks, loading, removeBookmark, updateBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesSearch = b.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || b.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(bookmarks.map(b => b.role).filter(Boolean))];

  const handleStartEdit = (bookmark: BookmarkedQuestion) => {
    setEditingId(bookmark.id);
    setEditNotes(bookmark.notes || '');
  };

  const handleSaveNotes = async (id: string) => {
    await updateBookmark(id, { notes: editNotes });
    setEditingId(null);
    setEditNotes('');
  };

  const handleDelete = async () => {
    if (deleteId) {
      await removeBookmark(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bookmark className="h-8 w-8" />
            Câu hỏi đã lưu
          </h1>
          <p className="text-muted-foreground mt-1">
            {bookmarks.length} câu hỏi đã được lưu để ôn tập
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {uniqueRoles.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterRole === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(null)}
              >
                Tất cả
              </Button>
              {uniqueRoles.map(role => (
                <Button
                  key={role}
                  variant={filterRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole(role!)}
                >
                  {ROLE_INFO[role as keyof typeof ROLE_INFO]?.labelVi || role}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterRole ? 'Không tìm thấy kết quả' : 'Chưa có câu hỏi nào được lưu'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterRole 
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Lưu câu hỏi từ các buổi phỏng vấn để ôn tập sau'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Question */}
                        <p className="font-medium mb-2">{bookmark.question_text}</p>
                        
                        {/* Meta */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          {bookmark.role && (
                            <Badge variant="outline" className="text-xs">
                              {ROLE_INFO[bookmark.role as keyof typeof ROLE_INFO]?.labelVi || bookmark.role}
                            </Badge>
                          )}
                          {bookmark.level && (
                            <Badge variant="outline" className="text-xs">
                              {LEVEL_INFO[bookmark.level as keyof typeof LEVEL_INFO]?.labelVi || bookmark.level}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(bookmark.created_at), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>

                        {/* Notes */}
                        {editingId === bookmark.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Thêm ghi chú..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveNotes(bookmark.id)}>
                                <Save className="h-3 w-3 mr-1" />
                                Lưu
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                <X className="h-3 w-3 mr-1" />
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : bookmark.notes ? (
                          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                            {bookmark.notes}
                          </div>
                        ) : null}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(bookmark)}
                          title="Thêm ghi chú"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(bookmark.id)}
                          className="text-destructive hover:text-destructive"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              Câu hỏi này sẽ bị xóa khỏi danh sách đã lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
