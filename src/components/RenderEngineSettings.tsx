// Render Engine Settings Modal
// Allows users to configure and manage AI image and video generation engines

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Key, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  PlayCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import type { RenderEngine, RenderProvider, VideoProvider } from '@/services/aiBrain/types';
import {
  getAllProviders,
  getAllVideoProviders,
  getUserRenderEngines,
  addRenderEngine,
  deleteRenderEngine,
  setDefaultRenderEngine,
  testRenderEngine,
} from '@/services/aiBrain/renderEngineService';
import { supabase } from '@/integrations/supabase/client';

// Test status types
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface TestResult {
  status: TestStatus;
  message: string;
  latencyMs?: number;
}

interface RenderEngineSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function RenderEngineSettings({ open, onOpenChange, userId }: RenderEngineSettingsProps) {
  const [engines, setEngines] = useState<RenderEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  
  // New engine form
  const [newProvider, setNewProvider] = useState<RenderProvider>('openai');
  const [newName, setNewName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Test panel state
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle', message: '' });
  const [isValidated, setIsValidated] = useState(false);

  const providers = getAllProviders();
  const videoProviders = getAllVideoProviders();

  useEffect(() => {
    if (open && userId) {
      loadEngines();
    }
  }, [open, userId]);

  const loadEngines = async () => {
    setLoading(true);
    try {
      const userEngines = await getUserRenderEngines(userId);
      setEngines(userEngines);
    } catch (error) {
      console.error('Failed to load engines:', error);
    }
    setLoading(false);
  };

  // Reset test state when provider or API key changes
  useEffect(() => {
    setTestResult({ status: 'idle', message: '' });
    setIsValidated(false);
  }, [newProvider, newApiKey]);

  // Test API key before saving
  const handleTestApiKey = async () => {
    const provider = providers.find(p => p.id === newProvider);
    if (provider?.requiresKey && !newApiKey.trim()) {
      setTestResult({ status: 'error', message: 'Please enter an API key first' });
      return;
    }

    setTestResult({ status: 'testing', message: 'Validating API key...' });
    const startTime = Date.now();

    try {
      const response = await supabase.functions.invoke('generate-with-engine', {
        body: {
          provider: newProvider,
          apiKey: newApiKey,
          test: true,
        },
      });

      const latencyMs = Date.now() - startTime;

      if (response.error) {
        setTestResult({ 
          status: 'error', 
          message: response.error.message || 'Connection failed',
          latencyMs 
        });
        setIsValidated(false);
      } else {
        setTestResult({ 
          status: 'success', 
          message: 'API key validated successfully!',
          latencyMs 
        });
        setIsValidated(true);
      }
    } catch (error) {
      setTestResult({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Test failed',
        latencyMs: Date.now() - startTime
      });
      setIsValidated(false);
    }
  };

  const handleAddEngine = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name for the engine');
      return;
    }

    const provider = providers.find(p => p.id === newProvider);
    if (provider?.requiresKey && !newApiKey.trim()) {
      toast.error('This provider requires an API key');
      return;
    }

    // Warn if not validated
    if (provider?.requiresKey && !isValidated) {
      const proceed = confirm('API key has not been validated. Do you want to save anyway?');
      if (!proceed) return;
    }

    setAdding(true);
    try {
      const engine = await addRenderEngine(
        userId,
        newProvider,
        newName,
        newApiKey || undefined
      );
      
      if (engine) {
        setEngines([...engines, engine]);
        setNewName('');
        setNewApiKey('');
        setTestResult({ status: 'idle', message: '' });
        setIsValidated(false);
        toast.success('Render engine added!');
      } else {
        toast.error('Failed to add engine');
      }
    } catch (error) {
      toast.error('Error adding engine');
    }
    setAdding(false);
  };

  const handleTestEngine = async (engine: RenderEngine) => {
    setTesting(engine.id);
    try {
      const result = await testRenderEngine(engine);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Test failed');
    }
    setTesting(null);
  };

  const handleSetDefault = async (engineId: string) => {
    try {
      await setDefaultRenderEngine(userId, engineId);
      setEngines(engines.map(e => ({
        ...e,
        isDefault: e.id === engineId,
      })));
      toast.success('Default engine updated');
    } catch (error) {
      toast.error('Failed to update default');
    }
  };

  const handleDeleteEngine = async (engineId: string) => {
    try {
      await deleteRenderEngine(engineId);
      setEngines(engines.filter(e => e.id !== engineId));
      toast.success('Engine removed');
    } catch (error) {
      toast.error('Failed to remove engine');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Render Engine Settings
          </DialogTitle>
          <DialogDescription>
            Configure AI image and video generation providers. Add your own API keys to use different engines.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="engines" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engines" className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </TabsTrigger>
          </TabsList>

          <TabsContent value="engines" className="space-y-4 mt-4">
            {/* Default Lovable Engine */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Lovable AI</CardTitle>
                    <Badge variant="secondary" className="text-xs">Built-in</Badge>
                  </div>
                  <Badge variant="default" className="bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Powered by Google Gemini. No API key required.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* User's Custom Engines */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : engines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No custom engines configured</p>
                <p className="text-sm">Add your own API keys to use different providers</p>
              </div>
            ) : (
              engines.map((engine) => (
                <Card key={engine.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">{engine.displayName}</CardTitle>
                        <Badge variant="outline" className="text-xs capitalize">
                          {engine.provider}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {engine.isDefault && (
                          <Badge variant="default" className="bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestEngine(engine)}
                          disabled={testing === engine.id}
                        >
                          {testing === engine.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        {!engine.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(engine.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEngine(engine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-sm flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      API Key configured
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Video Engines Tab */}
          <TabsContent value="video" className="space-y-4 mt-4">
            {/* Default Lovable Veo 3 Engine */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Lovable AI (Veo 3)</CardTitle>
                    <Badge variant="secondary" className="text-xs">Built-in</Badge>
                  </div>
                  <Badge variant="default" className="bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Powered by Google Veo 3. Creates cinematic 5-10 second video clips.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Video Provider Info Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Available Video Providers</h4>
              {videoProviders.filter(p => p.id !== 'lovable-veo3').map((provider) => (
                <Card key={provider.id} className="border-dashed">
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">{provider.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          <Key className="h-2.5 w-2.5 mr-1" />
                          Requires API Key
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {provider.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex flex-wrap gap-1">
                      {provider.models.map((model) => (
                        <Badge key={model} variant="outline" className="text-[10px]">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  To use Luma Ray or Minimax video models, add a Replicate API key in the "Add" tab. 
                  These engines will automatically appear here once configured.
                </span>
              </p>
            </div>

            {/* Show user's video engines if any */}
            {engines.filter(e => e.engineType === 'video').length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">My Video Engines</h4>
                {engines.filter(e => e.engineType === 'video').map((engine) => (
                  <Card key={engine.id}>
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm">{engine.displayName}</CardTitle>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {engine.provider}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          onClick={() => handleDeleteEngine(engine.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={newProvider} onValueChange={(v) => setNewProvider(v as RenderProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.filter(p => p.id !== 'lovable').map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <span>{provider.name}</span>
                          {provider.requiresKey && (
                            <Key className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {providers.find(p => p.id === newProvider)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g., My DALL-E Engine"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              {providers.find(p => p.id === newProvider)?.requiresKey && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="Enter your API key"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Your API key is encrypted and stored securely
                  </p>
                </div>
              )}

              {/* API Key Test Panel */}
              {providers.find(p => p.id === newProvider)?.requiresKey && newApiKey && (
                <Card className={`border-2 transition-colors ${
                  testResult.status === 'success' ? 'border-emerald-500/50 bg-emerald-500/5' :
                  testResult.status === 'error' ? 'border-destructive/50 bg-destructive/5' :
                  'border-border'
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      API Key Validation
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Test your API key before saving to ensure it works correctly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestApiKey}
                      disabled={testResult.status === 'testing'}
                      className="w-full"
                    >
                      {testResult.status === 'testing' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    {/* Test Results */}
                    <AnimatePresence mode="wait">
                      {testResult.status !== 'idle' && testResult.status !== 'testing' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-3 rounded-lg ${
                            testResult.status === 'success' 
                              ? 'bg-emerald-500/10 border border-emerald-500/30' 
                              : 'bg-destructive/10 border border-destructive/30'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {testResult.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                testResult.status === 'success' ? 'text-emerald-600' : 'text-destructive'
                              }`}>
                                {testResult.status === 'success' ? 'Connection Successful!' : 'Connection Failed'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {testResult.message}
                              </p>
                              {testResult.latencyMs && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  Response time: {testResult.latencyMs}ms
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Validation Status Badge */}
                    {isValidated && (
                      <Badge variant="outline" className="w-full justify-center bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready to save
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Add Button */}
              <Button 
                onClick={handleAddEngine} 
                className={`w-full ${isValidated ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                disabled={adding}
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isValidated ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isValidated ? 'Save Validated Engine' : 'Add Render Engine'}
              </Button>
            </div>

            {/* Available Models */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Available Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {providers.find(p => p.id === newProvider)?.models.map((model) => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
