import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AnnouncementCardProps {
  announcement: any;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(announcement.likes || 0);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: [`/api/announcements/${announcement.id}/comments`],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/announcements/${announcement.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to like announcement");
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de liker l'annonce",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/announcements/${announcement.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: [`/api/announcements/${announcement.id}/comments`] });
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    },
  });

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-chad-blue text-white">
                {announcement.authorId?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{announcement.authorId || 'Auteur'}</p>
              <p className="text-xs text-gray-500">
                {announcement.createdAt ? format(new Date(announcement.createdAt), 'dd/MM/yyyy à HH:mm') : 'Il y a 2h'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className="cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          <CardTitle className="text-lg mb-2 hover:text-chad-blue transition-colors">
            {announcement.title}
          </CardTitle>
          <p className="text-gray-700 mb-4">
            {announcement.content}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-600 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-blue-500"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments.length}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500">
              <Share2 className="h-4 w-4 mr-1" />
              Partager
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-3 mb-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-200">
                      {comment.authorId?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-sm">{comment.authorId}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(comment.createdAt), 'dd/MM/yyyy à HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {user && (
              <div className="flex space-x-2">
                <Input
                  placeholder="Écrivez un commentaire..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button 
                  size="sm" 
                  onClick={handleComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}