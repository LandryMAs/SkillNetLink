import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Search, 
  MessageCircle, 
  Users,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: conversationMessages = [] } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${selectedConversation}`],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      await apiRequest("POST", "/api/messages", { receiverId, content });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedConversation}`] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        if (selectedConversation) {
          queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedConversation}`] });
        }
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, [queryClient, selectedConversation]);

  // Create conversations from messages
  const conversations: Conversation[] = [];
  const conversationMap = new Map<string, Conversation>();

  messages.forEach((message) => {
    const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
    const isReceived = message.receiverId === user?.id;
    
    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        userId: otherUserId,
        userName: `Utilisateur ${otherUserId.slice(0, 8)}`,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unreadCount: isReceived && !message.read ? 1 : 0,
      });
    } else {
      const conv = conversationMap.get(otherUserId)!;
      if (new Date(message.createdAt) > new Date(conv.lastMessageTime)) {
        conv.lastMessage = message.content;
        conv.lastMessageTime = message.createdAt;
      }
      if (isReceived && !message.read) {
        conv.unreadCount++;
      }
    }
  });

  conversationMap.forEach((conv) => conversations.push(conv));
  conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        receiverId: selectedConversation,
        content: newMessage.trim(),
      });

      // Send via WebSocket for real-time updates
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "new_message",
          receiverId: selectedConversation,
          content: newMessage.trim(),
        }));
      }
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {searchQuery 
                    ? "Essayez avec d'autres mots-clés"
                    : "Vos conversations apparaîtront ici"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    onClick={() => setSelectedConversation(conversation.userId)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.userId
                        ? "bg-chad-blue text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.userAvatar} />
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {conversation.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${
                            selectedConversation === conversation.userId ? "text-white" : "text-gray-900"
                          }`}>
                            {conversation.userName}
                          </p>
                          <span className={`text-xs ${
                            selectedConversation === conversation.userId ? "text-blue-200" : "text-gray-500"
                          }`}>
                            {formatMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${
                            selectedConversation === conversation.userId ? "text-blue-200" : "text-gray-500"
                          }`}>
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-chad-red text-white ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-chad-blue text-white">
                        {selectedConversation.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Utilisateur {selectedConversation.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-green-600">En ligne</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      {message.senderId !== user?.id && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {message.senderId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.senderId === user?.id
                            ? "bg-chad-blue text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span
                          className={`text-xs block mt-1 ${
                            message.senderId === user?.id ? "text-blue-200" : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                      {message.senderId === user?.id && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback className="bg-chad-blue text-white text-xs">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-chad-blue hover:bg-chad-blue/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-600">
                  Choisissez une conversation pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
