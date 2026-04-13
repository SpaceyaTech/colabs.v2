import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Mail, ArrowLeft } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  price: number;
  seller?: string;
  image: string;
}

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  /**
   * TODO: STRIPE INTEGRATION - Verify Purchase
   *
   * When redirected from Stripe Checkout, verify the session:
   *
   * 1. Extract session_id from URL params:
   *    const searchParams = new URLSearchParams(window.location.search);
   *    const sessionId = searchParams.get('session_id');
   *
   * 2. Verify the session with backend (optional but recommended):
   *    const { data } = await supabase.functions.invoke('verify-checkout-session', {
   *      body: { sessionId }
   *    });
   *
   * 3. Fetch purchase details from `purchases` table
   *
   * See docs/STRIPE_INTEGRATION.md for full implementation details.
   */
  useEffect(() => {
    // Phase 2: Verify the Stripe session via a backend edge function
    // This prevents users from accessing the success page by manually setting URL params
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get('session_id');

    // if (sessionId) {
    //   const verifySession = async () => {
    //     const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
    //       body: { sessionId }
    //     });
    //     if (error) {
    //       console.error('Session verification failed:', error);
    //       navigate('/marketplace');
    //     }
    //   };
    //   verifySession();
    // }

    const {
      project: projectData,
      transactionId: txnId,
      paymentMethod: method,
    } = location.state || {};

    if (!projectData || !txnId) {
      navigate('/marketplace');
      return;
    }

    setProject(projectData);
    setTransactionId(txnId);
    setPaymentMethod(method);
  }, [location.state, navigate]);

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${project?.name.replace(/\s+/g, '_')}_project.zip`;
    link.click();
  };

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Purchase Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your project is ready for download.
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex gap-4 mb-6">
              <img
                src={project.image}
                alt={project.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                {project.seller && (
                  <p className="text-muted-foreground mb-2">by {project.seller}</p>
                )}
                <Badge variant="secondary">Purchased</Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${project.price}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">{transactionId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Purchase Date</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={handleDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Project
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Email Receipt
              </Button>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Your download link has been sent to your email address</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Access your purchase history in your account dashboard</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Contact the seller for any support or questions</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Leave a review to help other buyers</p>
              </div>
            </div>
          </Card>

          <div className="text-center space-y-4">
            <Button variant="outline" onClick={() => navigate('/marketplace')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PurchaseSuccess;
