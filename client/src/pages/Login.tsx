import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Shield, Users, Building } from "lucide-react";

const roleIcons = {
  student: GraduationCap,
  admin: Shield,
  mentor: Users,
  company: Building,
  assistant_admin: Shield,
};

const roleLabels = {
  student: "Étudiant",
  admin: "Administrateur",
  mentor: "Mentor",
  company: "Entreprise",
  assistant_admin: "Assistant Admin",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur SkillLink !",
        });
        // Refresh the page to update auth state
        window.location.href = "/";
      } else {
        const error = await response.text();
        toast({
          title: "Erreur de connexion",
          description: error || "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se connecter. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 dark:from-blue-950 dark:via-yellow-950 dark:to-red-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-8 bg-blue-600 mr-1"></div>
            <div className="w-12 h-8 bg-yellow-400 mr-1"></div>
            <div className="w-12 h-8 bg-red-600"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SkillLink</h1>
          <p className="text-gray-600 dark:text-gray-400">Plateforme des étudiants tchadiens</p>
        </div>

        <Card className="w-full shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte SkillLink
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@skilllink.td"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => {
                      const Icon = roleIcons[value as keyof typeof roleIcons];
                      return (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Comptes de test :</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Étudiant: student@skilllink.td / Student123!</div>
                <div>Admin: admin@skilllink.td / Admin123!</div>
                <div>Mentor: mentor@skilllink.td / Mentor123!</div>
                <div>Entreprise: company@skilllink.td / Company123!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}