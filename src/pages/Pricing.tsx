import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';
import { useSubscription, PlanType } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Pricing = () => {
  const { user } = useAuth();
  const { plan: currentPlan, daysRemaining, isLoading } = useSubscription();

  const plans: Array<{
    name: string;
    key: PlanType;
    price: string;
    period: string;
    description: string;
    features: string[];
    popular: boolean;
  }> = [
    {
      name: 'Starter',
      key: 'starter',
      price: 'Free',
      period: '',
      description: 'Perfect for individual contributors',
      features: [
        '1 seat included',
        'Basic leaderboard access',
        'Community support',
        'Basic analytics',
        'Public repositories only',
        'Up to 3 projects',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      key: 'pro',
      price: '$20',
      period: '/month',
      description: 'For growing teams and organizations',
      features: [
        'Up to 10 seats included',
        'Advanced leaderboard features',
        'Priority support',
        'Advanced analytics & insights',
        'Private repositories',
        'Custom integrations',
        'Team management (3 teams)',
        'Up to 25 projects',
      ],
      popular: true,
    },
    {
      name: 'Pro+',
      key: 'pro_plus',
      price: '$30',
      period: '/month',
      description: 'For large organizations with advanced needs',
      features: [
        'Unlimited seats',
        'Full leaderboard customization',
        '24/7 dedicated support',
        'Enterprise analytics',
        'Private & public repositories',
        'Custom integrations & API',
        'Advanced team management',
        'White-label options',
        'SLA guarantee',
        'Unlimited projects',
      ],
      popular: false,
    },
  ];

  /**
   * TODO: STRIPE INTEGRATION
   *
   * Replace the toast placeholder with actual Stripe Checkout:
   *
   * 1. Call the `create-checkout-session` edge function:
   *    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
   *      body: { planKey, userId: user.id, email: user.email }
   *    });
   *
   * 2. Redirect user to Stripe hosted checkout:
   *    if (data?.url) window.location.href = data.url;
   *
   * 3. On success, Stripe redirects to /pricing?session_id={SESSION_ID}
   *    The stripe-webhook edge function will have already updated user_subscriptions
   *
   * 4. useSubscription() will refetch and show the new plan
   *
   * See docs/STRIPE_INTEGRATION.md for full implementation details.
   */
  const handleSelectPlan = async (planKey: PlanType) => {
    if (!user) {
      toast.info('Please sign in to select a plan');
      return;
    }
    if (planKey === currentPlan) return;

    // TODO: Replace with Stripe checkout session creation
    // const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    //   body: { planKey, userId: user.id, email: user.email }
    // });
    // if (error) { toast.error("Failed to start checkout"); return; }
    // if (data?.url) window.location.href = data.url;

    toast.info('Payment integration coming soon. Plan selection will be available shortly.');
  };

  const getButtonLabel = (planKey: PlanType) => {
    if (!user)
      return planKey === 'starter'
        ? 'Get Started Free'
        : `Choose ${planKey === 'pro_plus' ? 'Pro+' : 'Pro'}`;
    if (planKey === currentPlan) return 'Current Plan';
    return planKey === 'starter'
      ? 'Downgrade'
      : `Upgrade to ${planKey === 'pro_plus' ? 'Pro+' : 'Pro'}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              Choose the right plan for <span className="gradient-text">your team</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Scale your open-source contributions with our flexible pricing options. Start free and
              upgrade as your team grows.
            </p>
            {user && currentPlan !== 'starter' && daysRemaining !== null && (
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span>
                  Your {currentPlan === 'pro_plus' ? 'Pro+' : 'Pro'} plan expires in{' '}
                  <span className="text-foreground font-medium">{daysRemaining} days</span>
                </span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isCurrent = user && plan.key === currentPlan;

              return (
                <Card
                  key={plan.name}
                  className={`p-8 relative ${
                    plan.popular ? 'border-primary glow-effect' : 'border-border'
                  } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-4 right-4">
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${plan.popular && !isCurrent ? 'glow-effect' : ''}`}
                    variant={isCurrent ? 'secondary' : plan.popular ? 'default' : 'outline'}
                    disabled={!!isCurrent || isLoading}
                    onClick={() => handleSelectPlan(plan.key)}
                  >
                    {getButtonLabel(plan.key)}
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">
              Need a custom solution for your enterprise?
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
