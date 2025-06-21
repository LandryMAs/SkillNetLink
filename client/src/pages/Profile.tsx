import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Plus,
  Download,
  Eye
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    university: user?.university || "",
    field: user?.field || "",
    yearOfStudy: user?.yearOfStudy || 1,
    location: user?.location || "",
    skills: user?.skills || [],
  });

  const { data: userProjects = [] } = useQuery({
    queryKey: [`/api/projects?creator=${user?.id}`],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      university: user?.university || "",
      field: user?.field || "",
      yearOfStudy: user?.yearOfStudy || 1,
      location: user?.location || "",
      skills: user?.skills || [],
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-32 gradient-chad"></div>
        <CardContent className="px-6 pb-6 -mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
              <AvatarFallback className="bg-chad-blue text-white text-3xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Prénom"
                      value={editData.firstName}
                      onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    />
                    <Input
                      placeholder="Nom"
                      value={editData.lastName}
                      onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    />
                  </div>
                  <Textarea
                    placeholder="Bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {user?.bio || "Étudiant passionné"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-chad-blue hover:bg-chad-blue/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button className="bg-chad-red hover:bg-chad-red/90">
                    <Download className="h-4 w-4 mr-2" />
                    CV PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="h-5 w-5 mr-2 text-chad-blue" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Université"
                    value={editData.university}
                    onChange={(e) => setEditData({...editData, university: e.target.value})}
                  />
                  <Input
                    placeholder="Domaine d'étude"
                    value={editData.field}
                    onChange={(e) => setEditData({...editData, field: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Année d'étude"
                    value={editData.yearOfStudy}
                    onChange={(e) => setEditData({...editData, yearOfStudy: parseInt(e.target.value)})}
                  />
                  <Input
                    placeholder="Localisation"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {user?.university && (
                    <div className="flex items-center text-sm">
                      <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{user.university}</span>
                    </div>
                  )}
                  {user?.field && (
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{user.field} {user.yearOfStudy && `• ${user.yearOfStudy}ème année`}</span>
                    </div>
                  )}
                  {user?.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compétences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(user?.skills || []).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="text-chad-blue">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Connexions</span>
                  <span className="font-semibold text-chad-blue">{user?.connections || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projets créés</span>
                  <span className="font-semibold text-chad-blue">{userProjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vues profil</span>
                  <span className="font-semibold text-chad-blue">127</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Expérience</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-chad-blue pl-4">
                  <h4 className="font-semibold">Stage développeur web</h4>
                  <p className="text-sm text-gray-600">Tech Solutions BF • 3 mois</p>
                  <p className="text-sm text-gray-700 mt-2">
                    Développement d'applications web avec React et Node.js. 
                    Travail en équipe agile sur des projets clients.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mes Projets</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau projet
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProjects.map((project: any) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{project.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{project.category}</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Portfolio</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
