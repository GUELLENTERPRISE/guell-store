import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTermsAndConditions } from '@/hooks/useTermsAndConditions';
import LoadingState from '@/components/LoadingState';
import { Save, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminTermsManagement = () => {
  const { terms, loading, updating, updateTerms } = useTermsAndConditions();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    version: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (terms) {
      setFormData({
        title: terms.title,
        content: terms.content,
        version: terms.version
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.version) {
      return;
    }

    const success = await updateTerms(formData.title, formData.content, formData.version);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ title: '', content: '', version: '' });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Terms and Conditions Management
              </CardTitle>
              <CardDescription>
                Manage the terms and conditions displayed on your website
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {terms && !isEditing && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{terms.title}</DialogTitle>
                      <DialogDescription>
                        Version {terms.version} • Last updated: {new Date(terms.last_updated).toLocaleDateString()}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh]">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{terms.content}</pre>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
              {!isEditing ? (
                <Button onClick={handleEdit} disabled={!terms}>
                  Edit Terms
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updating}>
                    <Save className="w-4 h-4 mr-2" />
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing && terms ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current Version</Label>
                <p className="text-2xl font-bold">{terms.version}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-lg">{terms.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(terms.last_updated).toLocaleDateString()} at {new Date(terms.last_updated).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Content Preview</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {terms.content.substring(0, 200)}...
                  </p>
                </div>
              </div>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title for terms and conditions"
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 2.0, 2.1, etc."
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the full terms and conditions content..."
                  className="min-h-[400px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can use plain text with line breaks. The content will be displayed exactly as typed.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No terms and conditions found.</p>
              <Button onClick={handleEdit} className="mt-4">
                Create New Terms
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTermsManagement;