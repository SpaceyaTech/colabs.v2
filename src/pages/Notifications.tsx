import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, X, GitPullRequest, Star, MessageSquare, GitMerge, AlertCircle, UserPlus, Award, DollarSign, Code, Calendar } from "lucide-react";

const notifications = [
  { id: 1, type: "pull_request", title: "New pull request opened", description: "John Doe opened a pull request in react-ui-components", time: "2 hours ago", read: false, icon: GitPullRequest },
  { id: 2, type: "merge", title: "Pull request merged", description: "Your pull request was merged into main branch of awesome-project", time: "3 hours ago", read: false, icon: GitMerge },
  { id: 3, type: "star", title: "Project starred", description: "Jane Smith starred your project awesome-project", time: "4 hours ago", read: false, icon: Star },
  { id: 4, type: "comment", title: "New comment on issue", description: "Someone commented on issue #42 in awesome-project", time: "5 hours ago", read: true, icon: MessageSquare },
  { id: 5, type: "issue", title: "New issue reported", description: "Bug reported in login functionality of web-app-starter", time: "6 hours ago", read: true, icon: AlertCircle },
  { id: 6, type: "collaboration", title: "Collaboration request", description: "Alex wants to collaborate on your machine-learning-toolkit project", time: "8 hours ago", read: true, icon: UserPlus },
  { id: 7, type: "achievement", title: "Achievement unlocked", description: "You've earned the 'Code Contributor' badge for 10 merged PRs", time: "1 day ago", read: true, icon: Award },
  { id: 8, type: "payment", title: "Payment received", description: "You received $150 for your contribution to mobile-app-template", time: "1 day ago", read: true, icon: DollarSign },
  { id: 9, type: "code_review", title: "Code review requested", description: "Please review the changes in PR #24 of data-visualization-lib", time: "2 days ago", read: true, icon: Code },
  { id: 10, type: "deadline", title: "Project deadline reminder", description: "E-commerce dashboard project deadline is in 2 days", time: "2 days ago", read: true, icon: Calendar },
];

const Notifications = () => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Check className="h-4 w-4 mr-2" />Mark all read</Button>
            <Button variant="outline" size="sm"><BellOff className="h-4 w-4 mr-2" />Clear all</Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium">No notifications</h3>
            <p className="text-xs text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{notification.title}</span>
                      {!notification.read && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Notifications;
