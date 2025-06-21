import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3,
  UserCheck,
  AlertTriangle
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  if (user?.role !== "admin" && user?.role !== "assistant_admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: pendingServices = [] } = useQuery({
    queryKey: ["/api/admin/pending-services"],
  });

  const { data: serviceRequests = [] } = useQuery({
    queryKey: ["/api/admin/service-requests"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const approveServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      await apiRequest("POST", `/api/services/${serviceId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service approuvé",
        description: "Le service a été approuvé et publié",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le service",
        variant: "destructive",
      });
    },
  });

  const rejectServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      await apiRequest("DELETE", `/api/admin/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-services"] });
      toast({
        title: "Service rejeté",
        description: "Le service a été rejeté",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le service",
        variant: "destructive",
      });
    },
  });

  const approveServiceRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("POST", `/api/admin/service-requests/${requestId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests"] });
      toast({
        title: "Demande approuvée",
        description: "La demande de service a été approuvée",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande",
        variant: "destructive",
      });
    },
  });

  const rejectServiceRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("POST", `/api/admin/service-requests/${requestId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests"] });
      toast({
        title: "Demande rejetée",
        description: "La demande de service a été rejetée",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive",
      });
    },
  });

  const StatsCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-600">
          Gérez la plateforme SkillLink et modérez les contenus
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Utilisateurs totaux"
          value={stats.totalUsers}
          icon={Users}
          color="bg-chad-blue"
        />
        <StatsCard
          title="Services en attente"
          value={pendingServices.length}
          icon={Clock}
          color="bg-chad-yellow"
        />
        <StatsCard
          title="Demandes de service"
          value={serviceRequests.length}
          icon={MessageSquare}
          color="bg-chad-red"
        />
        <StatsCard
          title="Projets actifs"
          value={stats.activeProjects}
          icon={TrendingUp}
          color="bg-green-500"
        />
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services" className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Services ({pendingServices.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Demandes ({serviceRequests.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services en attente d'approbation</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingServices.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun service en attente
                  </h3>
                  <p className="text-gray-600">
                    Tous les services ont été traités
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingServices.map((service: any) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                          <p className="text-gray-700 mb-3">{service.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-medium text-chad-blue">{service.price}</span>
                            {service.location && <span>📍 {service.location}</span>}
                            {service.availability && <span>🕒 {service.availability}</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Proposé par: Utilisateur {service.providerId.slice(0, 8)}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => approveServiceMutation.mutate(service.id)}
                            disabled={approveServiceMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectServiceMutation.mutate(service.id)}
                            disabled={rejectServiceMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de service</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune demande en attente
                  </h3>
                  <p className="text-gray-600">
                    Toutes les demandes de service ont été traitées
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.map((request: any) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Demande pour: Service Title
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Catégorie: Service Category
                          </p>
                          <p className="text-gray-700 mb-3">{request.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              Demandeur: Utilisateur {request.requesterId.slice(0, 8)}
                            </span>
                            <span>
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => approveServiceRequestMutation.mutate(request.id)}
                            disabled={approveServiceRequestMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectServiceRequestMutation.mutate(request.id)}
                            disabled={rejectServiceRequestMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 10).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-chad-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          {user.university && (
                            <span className="text-xs text-gray-500">{user.university}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      {user.role === "student" && (
                        <Button variant="outline" size="sm">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Actions
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisateurs actifs</span>
                    <span className="font-semibold">{stats.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projets créés</span>
                    <span className="font-semibold">{stats.totalProjects || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services proposés</span>
                    <span className="font-semibold">{stats.totalServices || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages échangés</span>
                    <span className="font-semibold">{stats.totalMessages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connexions établies</span>
                    <span className="font-semibold">{stats.totalConnections || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-chad-blue rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Nouveau service créé</p>
                      <p className="text-xs text-gray-500">Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-chad-yellow rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Nouvel utilisateur inscrit</p>
                      <p className="text-xs text-gray-500">Il y a 3 heures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-chad-red rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Projet collaboratif créé</p>
                      <p className="text-xs text-gray-500">Il y a 5 heures</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
