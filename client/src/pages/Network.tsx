import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  UserPlus, 
  MessageCircle, 
  Users, 
  UserCheck,
  MapPin,
  GraduationCap,
  Briefcase
} from "lucide-react";

export default function Network() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: connections = [] } = useQuery({
    queryKey: ["/api/connections"],
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const connectMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      await apiRequest("POST", "/api/connections", { receiverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Demande de connexion envoyée",
        description: "Votre demande a été envoyée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de connexion",
        variant: "destructive",
      });
    },
  });

  const handleConnect = (userId: string) => {
    connectMutation.mutate(userId);
  };

  const UserCard = ({ user, showConnectButton = true }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || ""} />
            <AvatarFallback className="bg-chad-blue text-white">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h3>
            
            {user.field && user.university && (
              <p className="text-sm text-gray-600 mt-1">
                {user.field} • {user.university}
              </p>
            )}
            
            {user.location && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {user.location}
              </div>
            )}
            
            {user.bio && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}
            
            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.skills.slice(0, 3).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {user.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            {showConnectButton && (
              <Button
                size="sm"
                onClick={() => handleConnect(user.id)}
                disabled={connectMutation.isPending}
                className="bg-chad-blue hover:bg-chad-blue/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Connecter
              </Button>
            )}
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Réseau</h1>
        <p className="text-gray-600">
          Développez votre réseau professionnel avec d'autres étudiants tchadiens
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des étudiants par nom, université, domaine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Mes Connexions ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Découvrir
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            <UserCheck className="h-4 w-4 mr-2" />
            Demandes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {connections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune connexion pour le moment
                </h3>
                <p className="text-gray-600 mb-4">
                  Commencez à développer votre réseau en vous connectant avec d'autres étudiants
                </p>
                <Button className="bg-chad-blue hover:bg-chad-blue/90">
                  Découvrir des étudiants
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection: any) => (
                <UserCard 
                  key={connection.id} 
                  user={connection.user} 
                  showConnectButton={false} 
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {searchQuery.length > 2 ? (
            searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-600">
                    Essayez avec d'autres mots-clés
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((user: any) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rechercher des étudiants
                </h3>
                <p className="text-gray-600">
                  Tapez au moins 3 caractères pour commencer la recherche
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande en attente
              </h3>
              <p className="text-gray-600">
                Les demandes de connexion reçues apparaîtront ici
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
