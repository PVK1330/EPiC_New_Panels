import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Search,
  Paperclip,
  MoreVertical,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";

const BusinessMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

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
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Messages
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Chat with admin and support teams.
        </p>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        className="flex gap-4 flex-1 min-h-[600px]"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Conversations List */}
        <div className="w-full md:w-80 shrink-0 rounded-3xl border border-gray-200 bg-white flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {filteredConversations.map((conv, idx) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(idx)}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedConversation === idx
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{conv.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-secondary truncate">{conv.name}</p>
                      <p className="text-xs font-bold text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ml-2">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-500 mt-2">{conv.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 rounded-3xl border border-gray-200 bg-white flex flex-col md:flex shadow-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{current.avatar}</span>
              <div>
                <p className="text-sm font-black text-secondary">{current.name}</p>
                <p className="text-xs font-bold text-gray-600">Online</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-gray-600" />
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
                  className={`max-w-xs px-4 py-2 rounded-xl ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-xs font-bold">{msg.text}</p>
                  <p className="text-[10px] font-bold opacity-70 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip size={18} className="text-gray-600" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Notice */}
        <div className="md:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm font-bold text-gray-600">Select a conversation to start chatting</p>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessMessages;
