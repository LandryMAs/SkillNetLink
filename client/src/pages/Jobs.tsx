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
import { 
  Plus, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Building,
  Calendar,
  Users,
  Search,
  Filter
} from "lucide-react";

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: [`/api/jobs/applications?user=${user?.id}`],
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      await apiRequest("POST", "/api/jobs", jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowCreateModal(false);
      toast({
        title: "Offre créée",
        description: "Votre offre d'emploi a été publiée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'offre d'emploi",
        variant: "destructive",
      });
    },
  });

  const applyJobMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: number; coverLetter: string }) => {
      await apiRequest("POST", `/api/jobs/${jobId}/apply`, { coverLetter });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/applications?user=${user?.id}`] });
      setShowApplicationModal(false);
      setSelectedJob(null);
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été soumise avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la candidature",
        variant: "destructive",
      });
    },
  });

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "internship": return "bg-chad-blue text-white";
      case "full_time": return "bg-chad-red text-white";
      case "part_time": return "bg-chad-yellow text-chad-blue";
      case "contract": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "internship": return "Stage";
      case "full_time": return "Temps plein";
      case "part_time": return "Temps partiel";
      case "contract": return "Contrat";
      default: return type;
    }
  };

  const JobCard = ({ job }: { job: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedJob(job)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-chad-blue rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
              <p className="text-gray-600 font-medium">{job.company}</p>
            </div>
          </div>
          <Badge className={getTypeColor(job.type)}>
            {getTypeLabel(job.type)}
          </Badge>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location}
          </div>
          {job.duration && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {job.duration}
            </div>
          )}
          {job.salary && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              {job.salary}
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(job.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {job.requirements?.slice(0, 3).map((req: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
            {job.requirements?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{job.requirements.length - 3}
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            className="bg-chad-blue hover:bg-chad-blue/90"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedJob(job);
              setShowApplicationModal(true);
            }}
          >
            Postuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CreateJobForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      company: "",
      location: "",
      type: "internship" as const,
      duration: "",
      salary: "",
      requirements: [] as string[],
      benefits: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createJobMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Titre du poste"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <Input
            placeholder="Entreprise"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            required
          />
        </div>

        <Textarea
          placeholder="Description du poste"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={4}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Lieu"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
          <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Type de contrat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internship">Stage</SelectItem>
              <SelectItem value="full_time">Temps plein</SelectItem>
              <SelectItem value="part_time">Temps partiel</SelectItem>
              <SelectItem value="contract">Contrat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Durée (ex: 6 mois)"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
          />
          <Input
            placeholder="Salaire (ex: 50,000 FCFA/mois)"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={createJobMutation.isPending} className="bg-chad-blue hover:bg-chad-blue/90">
            Publier l'offre
          </Button>
        </div>
      </form>
    );
  };

  const ApplicationForm = () => {
    const [coverLetter, setCoverLetter] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedJob) {
        applyJobMutation.mutate({ jobId: selectedJob.id, coverLetter });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900">{selectedJob?.title}</h4>
          <p className="text-gray-600">{selectedJob?.company}</p>
        </div>

        <Textarea
          placeholder="Lettre de motivation (optionnelle)"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={6}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowApplicationModal(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={applyJobMutation.isPending} className="bg-chad-blue hover:bg-chad-blue/90">
            Envoyer la candidature
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offres d'Emploi</h1>
          <p className="text-gray-600">
            Découvrez des opportunités de stages et d'emplois adaptées à votre profil
          </p>
        </div>
        {(user?.role === "company" || user?.role === "admin") && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-chad-blue hover:bg-chad-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Publier une offre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une offre d'emploi</DialogTitle>
              </DialogHeader>
              <CreateJobForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par titre, entreprise, lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="internship">Stages</SelectItem>
                <SelectItem value="full_time">Temps plein</SelectItem>
                <SelectItem value="part_time">Temps partiel</SelectItem>
                <SelectItem value="contract">Contrats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Toutes les offres ({filteredJobs.length})
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Mes candidatures ({myApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune offre trouvée
                </h3>
                <p className="text-gray-600">
                  {searchQuery || selectedType !== "all" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Aucune offre d'emploi disponible pour le moment"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune candidature
                </h3>
                <p className="text-gray-600">
                  Vous n'avez encore postulé à aucune offre
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myApplications.map((application: any) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Application Title</h4>
                        <p className="text-sm text-gray-600">Company Name</p>
                        <p className="text-xs text-gray-500">
                          Candidature envoyée le {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{application.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Details Modal */}
      <Dialog open={!!selectedJob && !showApplicationModal} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                    <p className="text-lg text-gray-600 font-medium">{selectedJob.company}</p>
                  </div>
                  <Badge className={getTypeColor(selectedJob.type)}>
                    {getTypeLabel(selectedJob.type)}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedJob.location}
                </div>
                {selectedJob.duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {selectedJob.duration}
                  </div>
                )}
                {selectedJob.salary && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {selectedJob.salary}
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(selectedJob.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Exigences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements.map((req: string, index: number) => (
                      <Badge key={index} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Avantages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((benefit: string, index: number) => (
                      <Badge key={index} variant="secondary">{benefit}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Fermer
                </Button>
                <Button 
                  className="bg-chad-blue hover:bg-chad-blue/90"
                  onClick={() => setShowApplicationModal(true)}
                >
                  Postuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postuler à l'offre</DialogTitle>
          </DialogHeader>
          <ApplicationForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
