import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanType } from "@/hooks/useSubscription";

interface UpgradePromptProps {
  plan: PlanType;
  feature: string;
}

const PLAN_LABELS: Record<PlanType, string> = {
  starter: "Starter",
  pro: "Pro",
  pro_plus: "Pro+",
};

const UpgradePrompt = ({ plan, feature }: UpgradePromptProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-8 text-center border-primary/20 bg-card">
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        Upgrade to {PLAN_LABELS[plan]}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {feature.charAt(0).toUpperCase() + feature.slice(1)} requires the{" "}
        <span className="text-primary font-medium">{PLAN_LABELS[plan]}</span> plan.
        Upgrade to unlock this and more features.
      </p>
      <Button onClick={() => navigate("/pricing")} className="gap-2">
        <Sparkles className="h-4 w-4" />
        View Plans
      </Button>
    </Card>
  );
};

export default UpgradePrompt;
