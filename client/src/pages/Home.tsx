import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import AnnouncementCard from "@/components/AnnouncementCard";
import { Link } from "wouter";
import { 
  Plus, 
  Users, 
  Briefcase, 
  Kanban, 
  TrendingUp,
  MessageCircle,
  Settings,
  FileText,
  ShoppingBag
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["/api/connections"],
  });

  const trendingProjects = projects.slice(0, 3);
  const recentConnections = connections.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          {/* Profile Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-16 gradient-chad"></div>
            <CardContent className="px-4 pb-4 -mt-8">
              <Avatar className="w-16 h-16 border-4 border-white">
                <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                <AvatarFallback className="bg-chad-blue text-white text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-2 font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.field && user?.university 
                  ? `${user.field} | ${user.university}`
                  : "Étudiant"
                }
              </p>
              {user?.location && (
                <p className="text-xs text-gray-500 mt-1">{user.location}</p>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connexions</span>
                  <span className="font-semibold text-chad-blue">{user?.connections || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Projets</span>
                  <span className="font-semibold text-chad-blue">{projects.filter(p => p.creatorId === user?.id).length}</span>
                </div>
              </div>
              
              <Link href="/profile">
                <Button className="w-full mt-3 bg-chad-blue hover:bg-chad-blue/90 text-white">
                  Voir le profil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Accès rapide</h4>
            <div className="space-y-2">
              <Link href="/profile">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Settings className="h-4 w-4 text-chad-blue" />
                  <span className="text-sm">Mon Portfolio</span>
                </div>
              </Link>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <FileText className="h-4 w-4 text-chad-red" />
                <span className="text-sm">Générer CV PDF</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Paramètres</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6">
          {/* Post Creation */}
          <Card className="p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                <AvatarFallback className="bg-chad-blue text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <input 
                type="text" 
                placeholder={`Quoi de neuf, ${user?.firstName} ?`}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-chad-blue focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-chad-blue">
                  <Plus className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-chad-blue">
                  <Kanban className="h-4 w-4 mr-2" />
                  Projet
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-chad-blue">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Service
                </Button>
              </div>
              <Button size="sm" className="bg-chad-blue hover:bg-chad-blue/90 text-white">
                Publier
              </Button>
            </div>
          </Card>

          {/* Announcements Feed */}
          <div className="space-y-6">
            {announcements.map((announcement: any) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3">
          {/* Trending Projects */}
          <Card className="p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Projets tendance</h4>
            <div className="space-y-3">
              {trendingProjects.map((project: any) => (
                <div key={project.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-chad-yellow rounded-lg flex items-center justify-center">
                    <Kanban className="h-4 w-4 text-chad-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                    <p className="text-xs text-gray-500">{project.currentParticipants} participants</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/projects">
              <Button variant="ghost" className="w-full mt-3 text-chad-blue hover:text-chad-blue/90">
                Voir tous les projets
              </Button>
            </Link>
          </Card>

          {/* Recent Connections */}
          <Card className="p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Nouvelles connexions</h4>
            <div className="space-y-3">
              {recentConnections.map((connection: any) => (
                <div key={connection.id} className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      CN
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nouvelle connexion</p>
                    <p className="text-xs text-gray-500">Étudiant</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-chad-blue">
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Popular Services */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Services populaires</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 text-chad-yellow">👔</div>
                  <span className="text-sm">Couture</span>
                </div>
                <span className="text-xs text-gray-500">24 offres</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 text-chad-red">🍽️</div>
                  <span className="text-sm">Cuisine</span>
                </div>
                <span className="text-xs text-gray-500">18 offres</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 text-chad-blue">🧹</div>
                  <span className="text-sm">Ménage</span>
                </div>
                <span className="text-xs text-gray-500">12 offres</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 text-gray-600">📚</div>
                  <span className="text-sm">Cours particuliers</span>
                </div>
                <span className="text-xs text-gray-500">31 offres</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
