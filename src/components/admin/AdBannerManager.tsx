import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Edit,
  Plus,
  Calendar,
  Target,
  DollarSign
} from 'lucide-react';

interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  section: 'store' | 'food' | 'both';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  priority: number;
  clicks: number;
  impressions: number;
  merchantId?: string; // If sponsored by specific merchant
  description: string;
}

const AdBannerManager: React.FC = () => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Mock data - in real app, this would come from backend
  useEffect(() => {
    const mockBanners: AdBanner[] = [
      {
        id: 'banner-1',
        title: 'Summer Sale - 50% Off',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop',
        targetUrl: '/food?promo=SUMMER50',
        section: 'both',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        priority: 1,
        clicks: 1247,
        impressions: 15420,
        description: 'Summer promotion with 50% discount on all food items'
      },
      {
        id: 'banner-2',
        title: 'Burger Palace Special',
        imageUrl: 'https://images.unsplash.com/photo-1568901343476-25c52d4f15e9?w=1200&h=400&fit=crop',
        targetUrl: '/food/merchant/burger-palace',
        section: 'food',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        priority: 2,
        clicks: 856,
        impressions: 9876,
        merchantId: 'merchant-1',
        description: 'Sponsored banner for Burger Palace'
      },
      {
        id: 'banner-3',
        title: 'Tech Store Launch',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
        targetUrl: '/store?promo=TECH20',
        section: 'store',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false,
        priority: 3,
        clicks: 342,
        impressions: 5432,
        description: 'New tech store launch promotion'
      }
    ];
    setBanners(mockBanners);
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Simulate upload - in real app, this would upload to cloud storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      
      if (editingBanner) {
        setEditingBanner({ ...editingBanner, imageUrl });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;

    setIsUploading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingBanner.id) {
        // Update existing banner
        setBanners(prev => prev.map(b => 
          b.id === editingBanner.id ? editingBanner : b
        ));
      } else {
        // Create new banner
        const newBanner: AdBanner = {
          ...editingBanner,
          id: `banner-${Date.now()}`,
          clicks: 0,
          impressions: 0
        };
        setBanners(prev => [...prev, newBanner]);
      }
      
      setShowForm(false);
      setEditingBanner(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    setBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  const handleToggleActive = async (bannerId: string) => {
    setBanners(prev => prev.map(b => 
      b.id === bannerId ? { ...b, isActive: !b.isActive } : b
    ));
  };

  const startEdit = (banner: AdBanner) => {
    setEditingBanner(banner);
    setPreviewUrl(banner.imageUrl);
    setShowForm(true);
  };

  const startNew = () => {
    setEditingBanner({
      id: '',
      title: '',
      imageUrl: '',
      targetUrl: '',
      section: 'both',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      priority: 5,
      clicks: 0,
      impressions: 0,
      description: ''
    });
    setPreviewUrl(null);
    setShowForm(true);
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'store': return 'bg-blue-100 text-blue-800';
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getCTR = (banner: AdBanner) => {
    return banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ad Banner Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional banners for store and food sections
          </p>
        </div>
        
        <Button onClick={startNew} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          New Banner
        </Button>
      </div>

      {/* Banner Form */}
      {showForm && editingBanner && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBanner.id ? 'Edit Banner' : 'Create New Banner'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="Enter banner title"
                />
              </div>
              
              <div>
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  value={editingBanner.targetUrl}
                  onChange={(e) => setEditingBanner({ ...editingBanner, targetUrl: e.target.value })}
                  placeholder="/food?promo=SUMMER50"
                />
              </div>
              
              <div>
                <Label htmlFor="section">Display Section</Label>
                <select
                  id="section"
                  value={editingBanner.section}
                  onChange={(e) => setEditingBanner({ ...editingBanner, section: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="both">Both Store & Food</option>
                  <option value="store">Store Only</option>
                  <option value="food">Food Only</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={editingBanner.priority}
                  onChange={(e) => setEditingBanner({ ...editingBanner, priority: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editingBanner.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setEditingBanner({ ...editingBanner, startDate: new Date(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editingBanner.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setEditingBanner({ ...editingBanner, endDate: new Date(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingBanner.description}
                onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                placeholder="Describe the banner campaign..."
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">Banner Image (1200x400px)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {previewUrl && (
                  <div className="w-32 h-20 border rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveBanner}
                disabled={isUploading || !editingBanner.title || !editingBanner.imageUrl}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isUploading ? 'Saving...' : 'Save Banner'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Banner Image */}
                  <div className="w-48 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{banner.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getSectionColor(banner.section)}>
                          {banner.section.toUpperCase()}
                        </Badge>
                        <Badge className={banner.isActive ? 'bg-green-100 text-green-800' : 'bg-muted text-gray-800'}>
                          {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {banner.description}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{banner.startDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span>Priority {banner.priority}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{banner.impressions.toLocaleString()} views</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>{getCTR(banner)}% CTR</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {banner.clicks.toLocaleString()} clicks • Ends {banner.endDate.toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(banner)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(banner.id)}
                        >
                          {banner.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdBannerManager;
