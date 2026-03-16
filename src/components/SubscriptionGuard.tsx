import { ReactNode } from "react";
import { useSubscription, PlanType } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import UpgradePrompt from "@/components/UpgradePrompt";

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredPlan: PlanType;
  feature?: string;
}

const PLAN_HIERARCHY: Record<PlanType, number> = {
  starter: 0,
  pro: 1,
  pro_plus: 2,
};

export const SubscriptionGuard = ({ children, requiredPlan, feature }: SubscriptionGuardProps) => {
  const { user } = useAuth();
  const { plan, isLoading } = useSubscription();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (PLAN_HIERARCHY[plan] < PLAN_HIERARCHY[requiredPlan]) {
    return <UpgradePrompt plan={requiredPlan} feature={feature ?? "this feature"} />;
  }

  return <>{children}</>;
};
