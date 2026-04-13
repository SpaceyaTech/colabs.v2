import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X, Play, Eye, Download, Star, Shield, Calendar, User } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  views: number;
  downloads: number;
  tags: string[];
  image: string;
  industry: string;
  softwareType: string[];
  techStack: string[];
  launchReadiness: string;
  revenueModel: string;
  licensing: string;
  createdAt: string;
  seller?: string;
  features?: string[];
  videoUrl?: string;
  previewImages?: string[];
}

interface ProjectSidePanelProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (project: Project) => void;
}

const ProjectSidePanel = ({ project, isOpen, onClose, onPurchase }: ProjectSidePanelProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!project) return null;

  const handlePurchase = () => {
    onPurchase(project);
  };

  const previewImages = project.previewImages || [project.image];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-2xl font-bold mb-2">{project.name}</SheetTitle>
                {project.seller && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>by {project.seller}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span>{project.rating}</span>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Preview Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Preview</h3>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {project.videoUrl ? (
                    <div className="relative w-full h-full">
                      {!isVideoPlaying ? (
                        <div
                          className="relative w-full h-full bg-cover bg-center cursor-pointer group"
                          style={{ backgroundImage: `url(${project.image})` }}
                          onClick={() => setIsVideoPlaying(true)}
                        >
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-primary rounded-full p-4 group-hover:scale-110 transition-transform">
                              <Play className="h-8 w-8 text-primary-foreground fill-current" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <video
                          src={project.videoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={previewImages[currentImageIndex]}
                        alt={`${project.name} preview`}
                        className="w-full h-full object-cover"
                      />
                      {previewImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {previewImages.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{project.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </div>

              {/* Features */}
              {project.features && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Key Features</h3>
                  <ul className="space-y-1">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map(tech => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Project Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="text-sm">{project.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Launch Status</p>
                    <p className="text-sm">{project.launchReadiness}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue Model</p>
                    <p className="text-sm">{project.revenueModel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Software Type</p>
                    <p className="text-sm">{project.softwareType.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Licensing */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Licensing</h3>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{project.licensing}</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Price</h3>
                <div className="text-3xl font-bold text-primary">${project.price}</div>
              </div>

              {/* Add some bottom padding for the sticky button */}
              <div className="h-20" />
            </div>
          </ScrollArea>

          {/* Sticky Purchase Button */}
          <div className="border-t bg-background p-6">
            <Button
              onClick={handlePurchase}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Purchase for ${project.price}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectSidePanel;
