import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Bell, Github, Globe, EyeOff, Key, Trash2, Save, Settings as SettingsIcon, CreditCard, ExternalLink, Zap, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: SettingsIcon },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Github },
];

const Settings = () => {
  const { user } = useAuth();
  const { plan, isPro, isProPlus, expiresAt, daysRemaining } = useSubscription();
  const [activeSection, setActiveSection] = useState("profile");
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  /**
   * TODO: STRIPE INTEGRATION — Manage Billing Handler
   *
   * Opens the Stripe Customer Portal for the authenticated user.
   * Allows them to update payment methods, cancel subscription, view invoices.
   *
   * After Stripe is integrated:
   *   1. Uncomment the edge function logic in create-portal-session/index.ts
   *   2. Add STRIPE_SECRET_KEY via the Lovable secrets panel
   *   3. Run the DB migration to add stripe_customer_id column
   *   4. Ensure user has a stripe_customer_id (created during first payment)
   *
   * See docs/STRIPE_INTEGRATION.md for full implementation details.
   */
  const handleManageBilling = async () => {
    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { return_url: `${window.location.origin}/settings?section=billing` },
      });

      if (error) {
        // Stripe not configured yet — show info toast
        if (error.message?.includes("stripe_not_configured")) {
          toast.info("Billing portal coming soon", {
            description: "Stripe integration is not yet configured. This feature will be available after setup.",
          });
        } else if (error.message?.includes("no_customer")) {
          toast.info("Upgrade to access billing", {
            description: "You need to upgrade to a paid plan first to access billing management.",
          });
        } else {
          toast.error("Failed to open billing portal", {
            description: error.message || "An error occurred.",
          });
        }
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <h1 className="text-lg font-semibold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage your account settings and preferences.</p>

        <div className="flex gap-8">
          {/* Left nav */}
          <nav className="w-48 shrink-0 space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                  activeSection === id
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-medium mb-4">Public Profile</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">Change avatar</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 max-w-lg">
                    <div className="grid gap-1.5">
                      <Label htmlFor="name" className="text-xs">Name</Label>
                      <Input id="name" placeholder="Your full name" defaultValue={user?.user_metadata?.full_name || ""} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="username" className="text-xs">Username</Label>
                      <Input id="username" placeholder="Your username" defaultValue={user?.email?.split('@')[0] || ""} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="bio" className="text-xs">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us about yourself" rows={3} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="location" className="text-xs">Location</Label>
                      <Input id="location" placeholder="Your location" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="website" className="text-xs">Website</Label>
                      <Input id="website" placeholder="https://your-website.com" type="url" />
                    </div>
                    <Button size="sm" className="w-fit"><Save className="h-4 w-4 mr-2" />Save changes</Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-medium mb-4">Account Information</h2>
                  <div className="grid gap-4 max-w-lg">
                    <div className="grid gap-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                      <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Timezone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-sm font-medium text-destructive mb-4">Danger Zone</h2>
                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg max-w-lg">
                    <div>
                      <h4 className="text-sm font-medium">Delete Account</h4>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
                    </div>
                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-medium mb-1">Billing & Subscription</h2>
                  <p className="text-xs text-muted-foreground mb-5">Manage your plan, payment methods, and invoices.</p>

                  {/* Current Plan Card */}
                  <div className="border border-border rounded-lg p-5 max-w-lg mb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {plan === "pro_plus" ? "Pro+" : plan === "pro" ? "Pro" : "Starter"}
                          </h3>
                          <Badge
                            variant={isPro || isProPlus ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {isPro || isProPlus ? "Active" : "Free"}
                          </Badge>
                        </div>
                        {expiresAt && daysRemaining !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Renews in <span className="text-foreground font-medium">{daysRemaining} days</span>
                          </p>
                        )}
                        {!isPro && !isProPlus && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Free — no expiry
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {plan === "pro_plus" ? "$30" : plan === "pro" ? "$20" : "$0"}
                        </p>
                        {(isPro || isProPlus) && (
                          <p className="text-xs text-muted-foreground">/month</p>
                        )}
                      </div>
                    </div>

                    {/* Plan features summary */}
                    <div className="space-y-1.5 mb-5">
                      {(plan === "pro" || plan === "pro_plus"
                        ? [
                            "Advanced analytics & insights",
                            "Private repositories",
                            "Team management",
                            plan === "pro_plus" ? "API access & white-label" : "Up to 10 seats",
                          ]
                        : [
                            "Up to 3 projects",
                            "Basic analytics",
                            "Public repositories only",
                            "Community support",
                          ]
                      ).map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {/**
                       * TODO: STRIPE — Manage Billing button
                       * This button calls create-portal-session edge function.
                       * When Stripe is configured, it opens the Stripe Customer Portal.
                       * Currently shows a "coming soon" toast as Stripe is not set up.
                       */}
                      <Button
                        size="sm"
                        variant={isPro || isProPlus ? "default" : "outline"}
                        onClick={handleManageBilling}
                        disabled={isOpeningPortal}
                        className="gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        {isOpeningPortal ? "Opening portal…" : isPro || isProPlus ? "Manage Billing" : "Upgrade Plan"}
                        {!isOpeningPortal && <ExternalLink className="h-3 w-3 opacity-60" />}
                      </Button>
                      {!isPro && !isProPlus && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => window.location.href = "/pricing"}
                          className="gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          View Plans
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* What Billing Portal Provides */}
                  <div className="max-w-lg">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      What you can do in the billing portal
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: CreditCard, label: "Update payment method" },
                        { icon: Check, label: "View & download invoices" },
                        { icon: Zap, label: "Upgrade or downgrade plan" },
                        { icon: Shield, label: "Cancel subscription" },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Billing Notice */}
                <div className="max-w-lg p-4 rounded-md bg-muted/40 border border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Billing is managed by Stripe.</span>{" "}
                    Colabs never stores your card details. All payment information is securely handled
                    by Stripe's PCI-compliant infrastructure. Cancellations take effect at the end of
                    your current billing period.
                    {/* TODO: Remove this note once Stripe is configured */}
                    {" "}Stripe integration is currently being set up — billing management will be
                    fully available soon.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="space-y-6 max-w-lg">
                <h2 className="text-sm font-medium mb-4">Privacy Controls</h2>
                <div className="flex items-center justify-between">
                  <div><Label className="text-sm">Profile visibility</Label><p className="text-xs text-muted-foreground">Who can see your profile</p></div>
                  <Select defaultValue="public">
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public"><Globe className="h-3 w-3 inline mr-1" />Public</SelectItem>
                      <SelectItem value="private"><EyeOff className="h-3 w-3 inline mr-1" />Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                {[
                  { label: "Show email publicly", desc: "Display email on your profile", checked: false },
                  { label: "Activity status", desc: "Show when you're active", checked: true },
                  { label: "Project contributions", desc: "Show contributions on profile", checked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div><Label className="text-sm">{item.label}</Label><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    <Switch defaultChecked={item.checked} />
                  </div>
                ))}
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6 max-w-lg">
                <h2 className="text-sm font-medium mb-4">Notification Preferences</h2>
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Email Notifications</h3>
                  <div className="space-y-3">
                    {["Project updates", "New collaborators", "Issue comments", "Weekly digest"].map((label, i) => (
                      <div key={label} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch defaultChecked={i !== 2} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Push Notifications</h3>
                  <div className="space-y-3">
                    {["Instant messages", "Mentions", "Project invitations"].map((label) => (
                      <div key={label} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "integrations" && (
              <div className="space-y-6">
                <GitHubIntegration />

                <div>
                  <h2 className="text-sm font-medium mb-4">Other Integrations</h2>
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {[
                      { name: "GitLab", abbr: "GL", bg: "bg-blue-600" },
                      { name: "Bitbucket", abbr: "BB", bg: "bg-orange-500" },
                    ].map((svc) => (
                      <div key={svc.name} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-7 w-7 ${svc.bg} rounded flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">{svc.abbr}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{svc.name}</h4>
                            <p className="text-xs text-muted-foreground">Connect your {svc.name} account</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>Coming Soon</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-medium mb-4">API Access</h2>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium">Personal Access Token</h4>
                      <p className="text-xs text-muted-foreground">Generate a token to access our API</p>
                    </div>
                    <Button variant="outline" size="sm"><Key className="h-4 w-4 mr-2" />Generate Token</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
