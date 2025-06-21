import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Users, Briefcase, Kanban, MessageCircle, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-chad rounded-lg flex items-center justify-center">
                <Link className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-chad-blue">SkillLink</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-chad-blue hover:bg-chad-blue/90 text-white"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connectez-vous avec les 
            <span className="text-chad-blue"> étudiants tchadiens</span> au
            <span className="text-chad-yellow"> Burkina Faso</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            SkillLink est la plateforme de networking dédiée aux étudiants tchadiens. 
            Créez votre portfolio, collaborez sur des projets, trouvez des opportunités et développez votre réseau professionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-chad-blue hover:bg-chad-blue/90 text-white"
            >
              Rejoindre la communauté
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-chad-blue text-chad-blue hover:bg-chad-blue hover:text-white"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète pour développer votre carrière et créer des connexions durables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chad-blue rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-white" />
                </div>
                <CardTitle>Réseau Professionnel</CardTitle>
                <CardDescription>
                  Connectez-vous avec d'autres étudiants tchadiens, mentors et entreprises
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chad-yellow rounded-lg flex items-center justify-center mb-4">
                  <Kanban className="text-chad-blue" />
                </div>
                <CardTitle>Projets Collaboratifs</CardTitle>
                <CardDescription>
                  Créez et participez à des projets innovants avec d'autres étudiants
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chad-red rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="text-white" />
                </div>
                <CardTitle>Opportunités d'Emploi</CardTitle>
                <CardDescription>
                  Découvrez des stages, emplois et opportunités adaptés à votre profil
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chad-blue rounded-lg flex items-center justify-center mb-4">
                  <Star className="text-white" />
                </div>
                <CardTitle>Portfolio Digital</CardTitle>
                <CardDescription>
                  Créez un portfolio professionnel et générez votre CV en PDF
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chad-yellow rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="text-chad-blue" />
                </div>
                <CardTitle>Services Étudiants</CardTitle>
                <CardDescription>
                  Proposez et trouvez des services entre étudiants (cuisine, couture, etc.)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-chad-red rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="text-white" />
                </div>
                <CardTitle>Messagerie Privée</CardTitle>
                <CardDescription>
                  Communiquez directement avec vos contacts pour des discussions professionnelles
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-chad">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Commencez dès aujourd'hui à construire votre réseau professionnel et à développer vos opportunités.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-chad-blue hover:bg-gray-100"
          >
            Créer mon compte gratuitement
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-chad rounded-lg flex items-center justify-center">
                  <Link className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold">SkillLink</span>
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme de networking dédiée aux étudiants tchadiens au Burkina Faso.
                Construisez votre avenir professionnel avec notre communauté.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Fonctionnalités</li>
                <li>Projets</li>
                <li>Emplois</li>
                <li>Services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centre d'aide</li>
                <li>Contact</li>
                <li>Conditions d'utilisation</li>
                <li>Confidentialité</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SkillLink. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
