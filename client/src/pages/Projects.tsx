import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProjectCard from "@/components/ProjectCard";
import { 
  Plus, 
  Kanban, 
  Search, 
  Users,
  Lightbulb,
  Filter
} from "lucide-react";

const categories = [
  "Technologie",
  "Education",
  "Santé",
  "Agriculture",
  "E-commerce",
  "Finance",
  "Environnement",
  "Art & Design",
  "Social",
  "Autre"
];

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: myProjects = [] } = useQuery({
    queryKey: [`/api/projects?creator=${user?.id}`],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      await apiRequest("POST", "/api/projects", projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateModal(false);
      toast({
        title: "Projet créé",
        description: "Votre projet a été créé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive",
      });
    },
  });

  const joinProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest("POST", `/api/projects/${projectId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Demande envoyée",
        description: "Votre demande de participation a été envoyée",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre le projet",
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const CreateProjectForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      category: "",
      maxParticipants: 5,
      skills: [] as string[],
      imageUrl: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createProjectMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Titre du projet"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <Textarea
          placeholder="Description du projet"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={4}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Nombre max de participants"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
            min={2}
            max={20}
          />
        </div>

        <Input
          placeholder="URL de l'image (optionnel)"
          value={formData.imageUrl}
          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={createProjectMutation.isPending} className="bg-chad-blue hover:bg-chad-blue/90">
            Créer le projet
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-chad-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projets Collaboratifs</h1>
          <p className="text-gray-600">
            Créez et participez à des projets innovants avec d'autres étudiants
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-chad-blue hover:bg-chad-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
            </DialogHeader>
            <CreateProjectForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des projets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center">
            <Kanban className="h-4 w-4 mr-2" />
            Tous les projets ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Mes projets ({myProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun projet trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Aucun projet collaboratif disponible pour le moment"
                  }
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-chad-blue hover:bg-chad-blue/90"
                >
                  Créer le premier projet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project: any) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onJoin={() => joinProjectMutation.mutate(project.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {myProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Kanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun projet créé
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez encore créé aucun projet collaboratif
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-chad-blue hover:bg-chad-blue/90"
                >
                  Créer mon premier projet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project: any) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isOwner={true}
                  onJoin={() => {}}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
