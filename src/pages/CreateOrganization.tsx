import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/AuthGuard';
import { ArrowLeft, Building, Globe, Users, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CreateOrganization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website_url: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
    // Clear name error when user starts typing
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    } else if (formData.slug.length < 3) {
      newErrors.slug = 'URL slug must be at least 3 characters';
    }

    if (formData.website_url && !formData.website_url.startsWith('http')) {
      newErrors.website_url = 'Website URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsLoading(true);
    try {
      // Check if slug already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existingOrg) {
        setErrors({ slug: 'This URL slug is already taken. Please choose another.' });
        setIsLoading(false);
        return;
      }

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          website_url: formData.website_url || null,
        })
        .select()
        .single();

      if (orgError) {
        if (orgError.code === '23505') {
          // Unique constraint violation
          setErrors({ slug: 'This URL slug is already taken. Please choose another.' });
          return;
        }
        throw new Error('Failed to create organization. Please try again.');
      }

      // Add user as owner
      const { error: memberError } = await supabase.from('organization_members').insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
      });

      if (memberError) {
        throw new Error(
          'Organization created but failed to set up membership. Please contact support.'
        );
      }

      toast({
        title: 'Organization created successfully!',
        description: "Welcome to your new organization. Let's connect your GitHub repositories.",
      });

      // Redirect to GitHub integration setup
      navigate(`/organizations/${organization.slug}/setup`);
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error.message || 'Unable to create organization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8">
              <Button variant="ghost" size="sm" className="mb-4" asChild>
                <NavLink to="/organizations">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Organizations
                </NavLink>
              </Button>
              <h1 className="text-3xl font-bold mb-2">Create Your Organization</h1>
              <p className="text-muted-foreground">
                Set up your organization to start managing workflows and integrations
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Acme Inc."
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">/organizations/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, slug: e.target.value }));
                          if (errors.slug) {
                            setErrors((prev) => ({ ...prev, slug: '' }));
                          }
                        }}
                        placeholder="acme-inc"
                        className={`flex-1 ${errors.slug ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.slug && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {errors.slug}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This will be your organization's unique URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Brief description of your organization..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                      <Input
                        id="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, website_url: e.target.value }));
                          if (errors.website_url) {
                            setErrors((prev) => ({ ...prev, website_url: '' }));
                          }
                        }}
                        placeholder="https://acme.com"
                        className={`flex-1 ${errors.website_url ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.website_url && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {errors.website_url}
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">What's Next?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          After creating your organization, you'll connect your GitHub account to
                          select repositories for monitoring, then set up team members and automated
                          workflows.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Organization'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default CreateOrganization;
