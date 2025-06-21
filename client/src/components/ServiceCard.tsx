import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Clock, 
  Star,
  DollarSign,
  ShoppingBag
} from "lucide-react";

interface ServiceCardProps {
  service: any;
  onRequest: () => void;
}

export default function ServiceCard({ service, onRequest }: ServiceCardProps) {
  const getCategoryIcon = (category: string) => {
    const icons = {
      "Cuisine": "🍽️",
      "Couture": "👔",
      "Ménage": "🧹",
      "Cours particuliers": "📚",
      "Livraison": "🚚",
      "Informatique": "💻",
      "Traduction": "🌐",
      "Design": "🎨",
      "Photographie": "📸",
      "Autre": "⚙️"
    };
    return icons[category as keyof typeof icons] || "⚙️";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Cuisine": "bg-chad-red text-white",
      "Couture": "bg-chad-yellow text-chad-blue",
      "Ménage": "bg-chad-blue text-white",
      "Cours particuliers": "bg-green-500 text-white",
      "Livraison": "bg-purple-500 text-white",
      "Informatique": "bg-gray-700 text-white",
      "Traduction": "bg-orange-500 text-white",
      "Design": "bg-pink-500 text-white",
      "Photographie": "bg-indigo-500 text-white",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500 text-white";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        {/* Service Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {service.imageUrl ? (
            <img 
              src={service.imageUrl} 
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl">
                {getCategoryIcon(service.category)}
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={getCategoryColor(service.category)}>
              {service.category}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          {/* Service Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {service.title}
          </h3>

          {/* Service Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {service.description}
          </p>

          {/* Price */}
          <div className="flex items-center mb-4">
            <DollarSign className="h-4 w-4 text-chad-blue mr-1" />
            <span className="font-semibold text-lg text-chad-blue">
              {service.price || "Prix à négocier"}
            </span>
          </div>

          {/* Service Details */}
          <div className="space-y-2 mb-4">
            {service.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {service.location}
              </div>
            )}
            {service.availability && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {service.availability}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="h-4 w-4 fill-yellow-400 text-yellow-400" 
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">(4.8)</span>
          </div>

          {/* Provider Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-chad-blue text-white text-xs">
                  {service.providerId?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  Utilisateur {service.providerId?.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-500">Prestataire vérifié</p>
              </div>
            </div>
            
            <Button 
              size="sm" 
              onClick={onRequest}
              className="bg-chad-red hover:bg-chad-red/90 text-white"
            >
              Contacter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
