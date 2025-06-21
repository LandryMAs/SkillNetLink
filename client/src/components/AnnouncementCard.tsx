import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Share, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementCardProps {
  announcement: any;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/announcements/${announcement.id}/like`);
      } else {
        await apiRequest("POST", `/api/announcements/${announcement.id}/like`);
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/announcements/${announcement.id}/comments`, {
        content,
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/announcements/${announcement.id}/comments`] });
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-chad-blue text-white";
      case "job":
        return "bg-chad-red text-white";
      case "service":
        return "bg-chad-yellow text-chad-blue";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case "project":
        return "Projet";
      case "job":
        return "Offre";
      case "service":
        return "Service";
      default:
        return "Général";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-chad-blue text-white">
              AU
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">Auteur</h4>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
              <Badge className={getBadgeColor(announcement.type)}>
                {getBadgeText(announcement.type)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">Étudiant</p>
            
            <div className="mt-3">
              {announcement.title && (
                <h5 className="font-medium text-gray-900 mb-2">{announcement.title}</h5>
              )}
              <p className="text-gray-700 text-sm leading-relaxed">
                {announcement.content}
              </p>
              
              {announcement.imageUrl && (
                <img 
                  src={announcement.imageUrl} 
                  alt="Announcement" 
                  className="mt-3 rounded-lg w-full h-48 object-cover" 
                />
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`text-gray-600 hover:text-chad-red transition-colors ${
                    isLiked ? "text-chad-red" : ""
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {announcement.likes || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="text-gray-600 hover:text-chad-blue transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {announcement.commentsCount || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-chad-blue transition-colors"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
              {announcement.type === "project" && (
                <Button
                  size="sm"
                  className="bg-chad-yellow text-chad-blue hover:bg-chad-yellow/90"
                >
                  Rejoindre
                </Button>
              )}
              {announcement.type === "service" && (
                <Button
                  size="sm"
                  className="bg-chad-red text-white hover:bg-chad-red/90"
                >
                  Contacter
                </Button>
              )}
              {announcement.type === "job" && (
                <Button
                  size="sm"
                  className="bg-chad-blue text-white hover:bg-chad-blue/90"
                >
                  Postuler
                </Button>
              )}
            </div>
            
            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-medium text-sm">Utilisateur</span>
                      <p className="text-sm text-gray-700 mt-1">
                        Excellent projet ! Très intéressé par cette initiative.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-chad-blue text-white text-xs">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!newComment.trim() || commentMutation.isPending}
                    className="text-chad-blue hover:text-chad-blue/90"
                    variant="ghost"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
