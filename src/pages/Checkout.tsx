import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Shield, ArrowLeft } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  price: number;
  seller?: string;
  licensing: string;
  image: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa'>('card');
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const projectData = location.state?.project;
      if (!projectData) {
        navigate('/marketplace');
        return;
      }
      setProject(projectData);
    })();
  }, [location.state, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * TODO: STRIPE INTEGRATION - Marketplace Payments
   *
   * Replace the simulated payment with Stripe Checkout:
   *
   * Option A: Stripe Checkout (Recommended)
   *   1. Call `create-marketplace-checkout` edge function:
   *      const { data, error } = await supabase.functions.invoke('create-marketplace-checkout', {
   *        body: {
   *          projectId: project.id,
   *          projectName: project.name,
   *          amount: total,
   *          userId: user.id,
   *          email: formData.email
   *        }
   *      });
   *
   *   2. Redirect to Stripe hosted checkout:
   *      window.location.href = data.url;
   *
   *   3. Stripe redirects to /purchase-success?session_id={SESSION_ID}
   *
   * Option B: Stripe Payment Intents (Embedded Elements)
   *   - Requires @stripe/react-stripe-js package
   *   - Use <CardElement> for card input
   *   - Call create-payment-intent, then confirmCardPayment()
   *
   * For M-PESA integration, consider Stripe + local payment method
   * or a separate M-PESA provider (e.g., Africa's Talking, Flutterwave).
   *
   * See docs/STRIPE_INTEGRATION.md for full implementation details.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // TODO: Replace with Stripe checkout session creation
      // const { data, error } = await supabase.functions.invoke('create-marketplace-checkout', {
      //   body: { projectId: project.id, amount: total * 100, email: formData.email }
      // });
      // if (data?.url) window.location.href = data.url;

      // Current: Simulated payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      navigate('/purchase-success', {
        state: {
          project,
          paymentMethod,
          transactionId: `TXN-${Date.now()}`, // TODO: Replace with Stripe session_id
        },
      });
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    }
  };

  if (!project) {
    return null;
  }

  const tax = Math.round(project.price * 0.1 * 100) / 100;
  const total = project.price + tax;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/marketplace')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="p-6 h-fit">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="flex gap-4 mb-6">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  {project.seller && (
                    <p className="text-sm text-muted-foreground">by {project.seller}</p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {project.licensing}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${project.price}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${project.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Your purchase is protected by our secure payment system</span>
                </div>
              </div>
            </Card>

            {/* Payment Form */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Payment Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className="h-12 justify-start"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('mpesa')}
                      className="h-12 justify-start"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      M-PESA
                    </Button>
                  </div>
                </div>

                {/* Payment Fields */}
                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to M-PESA to complete your payment of KES{' '}
                      {Math.round(total * 130)}.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full h-12 text-lg" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay $${total}`}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
