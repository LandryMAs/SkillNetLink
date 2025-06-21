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
import ServiceCard from "@/components/ServiceCard";
import { 
  Plus, 
  ShoppingBag, 
  Search, 
  Settings,
  Clock,
  CheckCircle
} from "lucide-react";

const serviceCategories = [
  "Cuisine",
  "Couture",
  "Ménage",
  "Cours particuliers",
  "Livraison",
  "Informatique",
  "Traduction",
  "Design",
  "Photographie",
  "Autre"
];

export default function Services() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: myServices = [] } = useQuery({
    queryKey: [`/api/services?provider=${user?.id}`],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      await apiRequest("POST", "/api/services", serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowCreateModal(false);
      toast({
        title: "Service créé",
        description: "Votre service a été soumis pour approbation par les administrateurs",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le service",
        variant: "destructive",
      });
    },
  });

  const requestServiceMutation = useMutation({
    mutationFn: async ({ serviceId, message }: { serviceId: number; message: string }) => {
      await apiRequest("POST", `/api/services/${serviceId}/request`, { message });
    },
    onSuccess: () => {
      setShowRequestModal(false);
      setSelectedService(null);
      toast({
        title: "Demande envoyée",
        description: "Votre demande de service a été envoyée et sera examinée par les administrateurs",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de service",
        variant: "destructive",
      });
    },
  });

  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CreateServiceForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      category: "",
      price: "",
      location: "",
      availability: "",
      imageUrl: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createServiceMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Titre du service"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <Textarea
          placeholder="Description détaillée du service"
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
              {serviceCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Prix (ex: 5,000 FCFA)"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Lieu de service"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />

          <Input
            placeholder="Disponibilité (ex: Lun-Ven 18h-20h)"
            value={formData.availability}
            onChange={(e) => setFormData({...formData, availability: e.target.value})}
          />
        </div>

        <Input
          placeholder="URL de l'image (optionnel)"
          value={formData.imageUrl}
          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note :</strong> Votre service sera soumis pour approbation par les administrateurs avant d'être publié.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={createServiceMutation.isPending} className="bg-chad-blue hover:bg-chad-blue/90">
            Créer le service
          </Button>
        </div>
      </form>
    );
  };

  const RequestServiceForm = () => {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedService) {
        requestServiceMutation.mutate({ serviceId: selectedService.id, message });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900">{selectedService?.title}</h4>
          <p className="text-gray-600">{selectedService?.category}</p>
          <p className="text-chad-blue font-medium">{selectedService?.price}</p>
        </div>

        <Textarea
          placeholder="Message pour le prestataire (détails de votre demande, date souhaitée, etc.)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Information :</strong> Votre demande sera d'abord examinée par les administrateurs avant d'être transmise au prestataire.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={requestServiceMutation.isPending} className="bg-chad-red hover:bg-chad-red/90">
            Envoyer la demande
          </Button>
        </div>
      </form>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending_approval": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "pending_approval": return "En attente";
      case "inactive": return "Inactif";
      default: return status;
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Étudiants</h1>
          <p className="text-gray-600">
            Proposez et trouvez des services entre étudiants tchadiens
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-chad-yellow text-chad-blue hover:bg-chad-yellow/90">
              <Plus className="h-4 w-4 mr-2" />
              Proposer un service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau service</DialogTitle>
            </DialogHeader>
            <CreateServiceForm />
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
                placeholder="Rechercher des services..."
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
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Tous les services ({filteredServices.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Mes services ({myServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun service trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Aucun service disponible pour le moment"
                  }
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-chad-yellow text-chad-blue hover:bg-chad-yellow/90"
                >
                  Proposer le premier service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service: any) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onRequest={() => {
                    setSelectedService(service);
                    setShowRequestModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {myServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun service proposé
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez encore proposé aucun service
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-chad-yellow text-chad-blue hover:bg-chad-yellow/90"
                >
                  Proposer mon premier service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myServices.map((service: any) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{service.title}</h3>
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusLabel(service.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{service.category}</p>
                        <p className="text-gray-700 mb-4">{service.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-medium text-chad-blue">{service.price}</span>
                          {service.location && <span>📍 {service.location}</span>}
                          {service.availability && <span>🕒 {service.availability}</span>}
                        </div>
                      </div>
                      <div className="ml-4">
                        {service.status === "pending_approval" && (
                          <div className="flex items-center text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">En attente</span>
                          </div>
                        )}
                        {service.status === "active" && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Publié</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Service Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander ce service</DialogTitle>
          </DialogHeader>
          <RequestServiceForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
