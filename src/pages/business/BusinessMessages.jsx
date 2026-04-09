import { Send, Search, Paperclip, MoreVertical } from "lucide-react";
import { useState } from "react";

const BusinessMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Admin Support",
      avatar: "👨‍💼",
      lastMessage: "Your COS payment has been processed",
      timestamp: "2h ago",
      unread: 2,
      messages: [
        { id: 1, sender: "admin", text: "Hello, how can I help you today?", timestamp: "1d ago" },
        { id: 2, sender: "user", text: "I need to update our worker details", timestamp: "1d ago" },
        { id: 3, sender: "admin", text: "Your COS payment has been processed", timestamp: "2h ago" },
      ],
    },
    {
      id: 2,
      name: "Compliance Team",
      avatar: "👩‍⚖️",
      lastMessage: "Your Q4 audit is scheduled for Jan 15",
      timestamp: "1d ago",
      unread: 0,
      messages: [
        { id: 1, sender: "admin", text: "Your Q4 audit is scheduled for Jan 15", timestamp: "1d ago" },
      ],
    },
    {
      id: 3,
      name: "Finance Department",
      avatar: "💰",
      lastMessage: "Invoice #INV-2024-001 is due",
      timestamp: "3d ago",
      unread: 0,
      messages: [
        { id: 1, sender: "admin", text: "Invoice #INV-2024-001 is due", timestamp: "3d ago" },
      ],
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const current = conversations[selectedConversation];

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-200px)]">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-2">Chat with admin and support teams</p>
      </div>

      {/* Messages Container */}
      <div className="flex gap-4 flex-1 h-[calc(100vh-350px)]">
        {/* Conversations List */}
        <div className="w-full md:w-80 shrink-0 bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {filteredConversations.map((conv, idx) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(idx)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === idx
                    ? "bg-blue-100 border border-blue-300"
                    : "hover:bg-slate-100 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{conv.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-semibold truncate">{conv.name}</p>
                      <p className="text-slate-600 text-sm truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-2">{conv.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col md:flex shadow-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{current.avatar}</span>
              <div>
                <p className="text-slate-900 font-semibold">{current.name}</p>
                <p className="text-slate-600 text-sm">Online</p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded transition-colors">
              <MoreVertical size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {current.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded transition-colors">
                <Paperclip size={18} className="text-slate-600" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Notice */}
        <div className="md:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-600">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessMessages;
