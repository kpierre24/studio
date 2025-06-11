
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { User, DirectMessage, CreateDirectMessagePayload, MarkDirectMessageReadPayload } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare, Users, Search, Check, CheckCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function MessagesPage() {
  const { state, handleSendDirectMessage, handleMarkMessageRead } = useAppContext();
  const { currentUser, users, directMessages, isLoading } = state;

  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtered list of users that can be messaged (excluding current user)
  const availableRecipients = useMemo(() => {
    if (!currentUser) return [];
    return users.filter(user => 
      user.id !== currentUser.id && 
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, currentUser, searchTerm]);

  // Group messages by conversation partner
  const conversations = useMemo(() => {
    if (!currentUser) return {};
    const convos: Record<string, { partner: User, messages: DirectMessage[], unreadCount: number, lastMessageTimestamp: number }> = {};

    directMessages.forEach(msg => {
      const partnerId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
      const partner = users.find(u => u.id === partnerId);
      if (!partner) return; // Skip if partner not found (should ideally not happen)

      if (!convos[partnerId]) {
        convos[partnerId] = { partner, messages: [], unreadCount: 0, lastMessageTimestamp: 0 };
      }
      convos[partnerId].messages.push(msg);
      if (msg.recipientId === currentUser.id && !msg.read) {
        convos[partnerId].unreadCount++;
      }
      if (msg.timestamp > convos[partnerId].lastMessageTimestamp) {
        convos[partnerId].lastMessageTimestamp = msg.timestamp;
      }
    });
    // Sort messages within each conversation
    Object.values(convos).forEach(convo => convo.messages.sort((a, b) => a.timestamp - b.timestamp));
    return convos;
  }, [directMessages, currentUser, users]);
  
  const sortedConversationKeys = useMemo(() => {
    return Object.keys(conversations).sort((a, b) => conversations[b].lastMessageTimestamp - conversations[a].lastMessageTimestamp);
  }, [conversations]);


  const [activeConversationPartnerId, setActiveConversationPartnerId] = useState<string | null>(null);

  const activeMessages = useMemo(() => {
    if (!activeConversationPartnerId || !conversations[activeConversationPartnerId]) return [];
    return conversations[activeConversationPartnerId].messages;
  }, [activeConversationPartnerId, conversations]);
  
  const activePartner = useMemo(() => {
    if (!activeConversationPartnerId || !conversations[activeConversationPartnerId]) return null;
    return conversations[activeConversationPartnerId].partner;
  }, [activeConversationPartnerId, conversations]);


  // Mark messages as read when a conversation is opened
  useEffect(() => {
    if (activeConversationPartnerId && currentUser) {
      const unreadMessages = conversations[activeConversationPartnerId]?.messages.filter(
        msg => msg.recipientId === currentUser.id && !msg.read
      );
      unreadMessages?.forEach(msg => {
        handleMarkMessageRead({ messageId: msg.id });
      });
    }
  }, [activeConversationPartnerId, currentUser, conversations, handleMarkMessageRead]);


  const handleSendMessage = async () => {
    if (!currentUser || !selectedRecipientId || !messageContent.trim()) {
      // Basic validation, toast can be added for better UX
      alert("Recipient and message content are required.");
      return;
    }
    const payload: CreateDirectMessagePayload = {
      recipientId: selectedRecipientId,
      content: messageContent,
    };
    await handleSendDirectMessage(payload);
    setMessageContent(''); // Clear message input after sending
    if(selectedRecipientId) setActiveConversationPartnerId(selectedRecipientId); // Switch to the conversation
    setSelectedRecipientId(null); // Clear recipient selection for new message form
  };
  
  const handleSelectConversation = (partnerId: string) => {
    setActiveConversationPartnerId(partnerId);
    setSelectedRecipientId(null); // Clear new message recipient if selecting a conversation
    setMessageContent(''); // Clear message content
  };


  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-headline font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-8 w-8 text-primary" />
        Messages
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
        {/* Conversation List / New Message Form */}
        <Card className="md:col-span-1 flex flex-col h-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Conversations & New Message
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-0">
            <div className="p-4 border-b">
                <Label htmlFor="recipient">New Message To:</Label>
                <Select value={selectedRecipientId || ""} onValueChange={(value) => {setSelectedRecipientId(value); setActiveConversationPartnerId(null);}}>
                    <SelectTrigger id="recipient" className="mt-1">
                        <SelectValue placeholder="Select a recipient..." />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="p-2">
                            <Input 
                                placeholder="Search users..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="mb-2"
                            />
                        </div>
                        {availableRecipients.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar"/>
                                <AvatarFallback>{user.name.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            {user.name} ({user.role})
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <ScrollArea className="h-[calc(100%-100px)]"> {/* Adjust height as needed */}
              {sortedConversationKeys.length === 0 && !selectedRecipientId && (
                <p className="p-4 text-muted-foreground text-center">No conversations yet. Start a new message.</p>
              )}
              {sortedConversationKeys.map(partnerId => {
                const convo = conversations[partnerId];
                if (!convo) return null;
                const lastMsg = convo.messages[convo.messages.length - 1];
                return (
                  <Button
                    key={partnerId}
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto rounded-none border-b ${activeConversationPartnerId === partnerId ? 'bg-accent' : ''}`}
                    onClick={() => handleSelectConversation(partnerId)}
                  >
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={convo.partner.avatarUrl} alt={convo.partner.name} data-ai-hint="user avatar" />
                      <AvatarFallback>{convo.partner.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{convo.partner.name}</span>
                        {lastMsg && <span className="text-xs text-muted-foreground">{format(new Date(lastMsg.timestamp), 'p')}</span>}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground truncate w-4/5">
                            {lastMsg?.senderId === currentUser.id && <span className="font-semibold">You: </span>}
                            {lastMsg?.content}
                        </p>
                        {convo.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {convo.unreadCount}
                            </span>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Display and Composer Area */}
        <Card className="md:col-span-2 flex flex-col h-full shadow-lg">
          {activeConversationPartnerId && activePartner ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={activePartner.avatarUrl} alt={activePartner.name} data-ai-hint="user avatar"/>
                        <AvatarFallback>{activePartner.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{activePartner.name}</CardTitle>
                        <CardDescription>{activePartner.role}</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-grow p-4 space-y-4">
                {activeMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow ${
                      msg.senderId === currentUser.id 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`text-xs text-muted-foreground mt-1 px-1 flex items-center gap-1 ${msg.senderId === currentUser.id ? 'self-end' : 'self-start'}`}>
                      <span>{format(new Date(msg.timestamp), 'MMM d, HH:mm')}</span>
                      {msg.senderId === currentUser.id && (
                        msg.read ? <CheckCheck className="h-3.5 w-3.5 text-blue-500" /> : <Check className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <CardFooter className="p-4 border-t">
                <form onSubmit={(e) => { e.preventDefault(); if (activeConversationPartnerId) {setSelectedRecipientId(activeConversationPartnerId); handleSendMessage(); } }} className="flex w-full gap-2 items-end">
                  <Textarea
                    placeholder={`Message ${activePartner.name}...`}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={1}
                    className="min-h-[40px] max-h-[120px] resize-none flex-grow bg-input border-input-border"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !messageContent.trim()}>
                    {isLoading ? <Loader2 className="animate-spin"/> : <Send />}
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : selectedRecipientId ? (
             <>
              <CardHeader className="border-b">
                 <CardTitle>New Message to: {users.find(u=>u.id === selectedRecipientId)?.name || "Selected User"}</CardTitle>
              </CardHeader>
              <div className="flex-grow p-4 flex items-center justify-center">
                <p className="text-muted-foreground">Compose your message below.</p>
              </div>
              <CardFooter className="p-4 border-t">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex w-full gap-2 items-end">
                    <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={2}
                    className="min-h-[60px] max-h-[150px] resize-none flex-grow bg-input border-input-border"
                    disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !messageContent.trim()}>
                        {isLoading ? <Loader2 className="animate-spin"/> : <Send />}
                    </Button>
                </form>
              </CardFooter>
             </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-6">
              <MessageSquare className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Select a conversation or start a new message.</p>
              <p className="text-sm text-center">Your messages will appear here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

