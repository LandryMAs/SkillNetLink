import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  Star, 
  Eye,
  GitBranch
} from "lucide-react";

interface ProjectCardProps {
  project: any;
  isOwner?: boolean;
  onJoin: () => void;
}

export default function ProjectCard({ project, isOwner = false, onJoin }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-chad-blue text-white";
      case "draft": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "completed": return "Terminé";
      case "draft": return "Brouillon";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Technologie": "bg-chad-blue text-white",
      "Education": "bg-chad-yellow text-chad-blue",
      "Santé": "bg-chad-red text-white",
      "Agriculture": "bg-green-500 text-white",
      "E-commerce": "bg-purple-500 text-white",
      "Finance": "bg-orange-500 text-white",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const progress = project.maxParticipants ? 
    (project.currentParticipants / project.maxParticipants) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        {/* Project Image */}
        <div className="aspect-video bg-gradient-to-br from-chad-blue to-chad-blue/80 relative overflow-hidden">
          {project.imageUrl ? (
            <img 
              src={project.imageUrl} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GitBranch className="h-16 w-16 text-white/50" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className={getCategoryColor(project.category)}>
              {project.category}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          {/* Project Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {project.title}
          </h3>

          {/* Project Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Skills */}
          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {project.skills.slice(0, 3).map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {project.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Participants Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Participants</span>
              <span>{project.currentParticipants}/{project.maxParticipants}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Project Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {project.currentParticipants} membres
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              4.5
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-chad-blue text-white text-xs">
                  {project.creatorId?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">
                Créé par Utilisateur {project.creatorId?.slice(0, 8)}
              </span>
            </div>
            
            {isOwner ? (
              <div className="flex space-x-1">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Voir
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={onJoin}
                disabled={progress >= 100}
                className="bg-chad-yellow text-chad-blue hover:bg-chad-yellow/90"
              >
                {progress >= 100 ? "Complet" : "Rejoindre"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
