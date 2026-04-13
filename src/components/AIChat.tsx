import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, History, Minimize2 } from 'lucide-react';

const AIChat = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: "I'm here to help you with your open source contributions!" },
      ]);
    }, 1000);

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-h-96">
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-title">AI Assistant</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => setIsExpanded(false)}
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Messages */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-small text-muted-foreground">
                Ask me anything about open source contributions!
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-small ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted text-muted-foreground mr-4'
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="text-small"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="shrink-0"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* History Toggle */}
          {showHistory && (
            <div className="border-t border-border pt-2">
              <p className="text-small text-muted-foreground">Chat history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;
