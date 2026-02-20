"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Download, Loader2, Sparkles, Database, FileJson, FileSpreadsheet, 
  CircleHelp, Tag, Type, Building2, Stethoscope, GraduationCap, 
  Activity, Save, BookOpen, Trash2, Star, Package, Ticket, HomeIcon
} from "lucide-react";
import { generateStructuredDataset } from "@/ai/flows/generate-structured-dataset";
import { generateDemoDataset } from "@/ai/flows/generate-demo-dataset-flow";
import { useToast } from "@/hooks/use-toast";
import { jsonToCsv, downloadFile } from "@/lib/data-utils";

type DatasetType = 'qa' | 'classification' | 'text_label' | 'records' | 'company' | 'medical' | 'school' | 'medical_diagnosis' | 'customer_review' | 'product_inventory' | 'support_ticket' | 'real_estate';

interface PromptTemplate {
  id: string;
  name: string;
  type: DatasetType;
  numRecords: number;
  description: string;
  advanced: boolean;
  customSchema: string;
}

const DATASET_TYPES: { value: DatasetType; label: string; icon: React.ReactNode }[] = [
  { value: 'qa', label: 'Q&A Pairs', icon: <CircleHelp className="w-4 h-4" /> },
  { value: 'classification', label: 'Classification', icon: <Tag className="w-4 h-4" /> },
  { value: 'text_label', label: 'Text Labeling', icon: <Type className="w-4 h-4" /> },
  { value: 'records', label: 'Generic Records', icon: <Database className="w-4 h-4" /> },
  { value: 'company', label: 'Company Data', icon: <Building2 className="w-4 h-4" /> },
  { value: 'medical', label: 'Medical History', icon: <Stethoscope className="w-4 h-4" /> },
  { value: 'school', label: 'Academic Records', icon: <GraduationCap className="w-4 h-4" /> },
  { value: 'medical_diagnosis', label: 'Clinical Diagnosis', icon: <Activity className="w-4 h-4" /> },
  { value: 'customer_review', label: 'Customer Reviews', icon: <Star className="w-4 h-4" /> },
  { value: 'product_inventory', label: 'Product Inventory', icon: <Package className="w-4 h-4" /> },
  { value: 'support_ticket', label: 'Support Tickets', icon: <Ticket className="w-4 h-4" /> },
  { value: 'real_estate', label: 'Real Estate Listings', icon: <HomeIcon className="w-4 h-4" /> },
];

export default function DatasetForge() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [datasetType, setDatasetType] = useState<DatasetType>('company');
  const [numRecords, setNumRecords] = useState(5);
  const [description, setDescription] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [customSchema, setCustomSchema] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const [promptLibrary, setPromptLibrary] = useState<PromptTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dataset_forge_prompts');
    if (saved) {
      setPromptLibrary(JSON.parse(saved));
    }
  }, []);

  const saveToLibrary = () => {
    if (!templateName) {
      toast({ title: "Name required", description: "Please enter a name for this prompt." });
      return;
    }
    const newTemplate: PromptTemplate = {
      id: Date.now().toString(),
      name: templateName,
      type: datasetType,
      numRecords,
      description,
      advanced: advancedMode,
      customSchema
    };
    const updated = [...promptLibrary, newTemplate];
    setPromptLibrary(updated);
    localStorage.setItem('dataset_forge_prompts', JSON.stringify(updated));
    setTemplateName('');
    toast({ title: "Saved", description: `Prompt "${newTemplate.name}" saved to library.` });
  };

  const loadFromLibrary = (tpl: PromptTemplate) => {
    setDatasetType(tpl.type);
    setNumRecords(tpl.numRecords);
    setDescription(tpl.description);
    setAdvancedMode(tpl.advanced);
    setCustomSchema(tpl.customSchema);
    toast({ title: "Loaded", description: `Prompt "${tpl.name}" loaded.` });
  };

  const deleteFromLibrary = (id: string) => {
    const updated = promptLibrary.filter(p => p.id !== id);
    setPromptLibrary(updated);
    localStorage.setItem('dataset_forge_prompts', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedData(null);
    try {
      let dataString = '';
      if (demoMode) {
        dataString = await generateDemoDataset({ datasetType });
      } else {
        const result = await generateStructuredDataset({
          datasetType: advancedMode ? undefined : datasetType,
          customSchema: advancedMode ? customSchema : undefined,
          numRecords,
          description
        });
        dataString = result.generatedData;
      }
      setGeneratedData(dataString);
      toast({ title: "Generation Successful", description: `Generated ${numRecords} records using Flash Engine.` });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: error.message || "An unexpected error occurred. Switching to demo mode might help if API keys are missing." 
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsJson = () => {
    if (!generatedData) return;
    downloadFile(generatedData, `dataset_${datasetType}_${Date.now()}.json`, 'application/json');
  };

  const downloadAsCsv = () => {
    if (!generatedData) return;
    const csvContent = jsonToCsv(generatedData);
    downloadFile(csvContent, `dataset_${datasetType}_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-indigo-100 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5 text-accent" />
                Forge Parameters
              </CardTitle>
              <CardDescription>Configure your synthetic data generation engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Dataset Category</Label>
                <Select value={datasetType} onValueChange={(val) => setDatasetType(val as DatasetType)} disabled={advancedMode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DATASET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          {t.icon}
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Number of Records (1-50)</Label>
                  {numRecords > 20 && (
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-bold animate-pulse">
                      FLASH OPTIMIZED
                    </span>
                  )}
                </div>
                <Input 
                  type="number" 
                  min={1} 
                  max={50} 
                  value={numRecords} 
                  onChange={(e) => setNumRecords(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Context / Specific Requirements</Label>
                <Textarea 
                  placeholder="e.g. Focus on luxury real estate in suburban New York..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Advanced Mode</Label>
                  <p className="text-xs text-muted-foreground">Override presets with custom JSON schema.</p>
                </div>
                <Switch checked={advancedMode} onCheckedChange={setAdvancedMode} />
              </div>

              {advancedMode && (
                <div className="space-y-2 animate-in zoom-in-95 duration-300">
                  <Label>Custom JSON Schema</Label>
                  <Textarea 
                    placeholder='{"type": "object", "properties": { "name": { "type": "string" } }}'
                    value={customSchema}
                    onChange={(e) => setCustomSchema(e.target.value)}
                    className="font-mono text-xs min-h-[150px]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-orange-700">Demo Mode</Label>
                  <p className="text-xs text-orange-600">Simulate generation without API keys.</p>
                </div>
                <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                onClick={handleGenerate} 
                disabled={loading} 
                className="w-full h-12 text-lg font-headline shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Forging Dataset...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Dataset
                  </>
                )}
              </Button>
              
              <div className="flex w-full gap-2">
                <Input 
                  placeholder="Save configuration as..." 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={saveToLibrary} title="Save to Prompt Library">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="shadow-xl border-indigo-100 min-h-[400px] flex flex-col bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Output Console
                </CardTitle>
                <CardDescription>Live preview of your generated synthetic data.</CardDescription>
              </div>
              {generatedData && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={downloadAsJson}>
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button variant="secondary" size="sm" onClick={downloadAsCsv}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-background/50 backdrop-blur-sm z-10 rounded-md">
                  <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium animate-pulse">Consulting the digital smiths...</p>
                </div>
              ) : generatedData ? (
                <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[500px] border shadow-inner">
                  <pre>{generatedData}</pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4 border-2 border-dashed rounded-lg">
                  <Database className="w-12 h-12 opacity-20" />
                  <p>Configure and generate to see results here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl border-indigo-100 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Prompt Library
              </CardTitle>
              <CardDescription>Reuse your most successful configurations.</CardDescription>
            </CardHeader>
            <CardContent>
              {promptLibrary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {promptLibrary.map((tpl) => (
                    <div 
                      key={tpl.id} 
                      className="group flex items-center justify-between p-3 rounded-md border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex flex-col cursor-pointer" onClick={() => loadFromLibrary(tpl)}>
                        <span className="font-semibold text-sm">{tpl.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{tpl.type} • {tpl.numRecords} recs</span>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteFromLibrary(tpl.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">No saved prompts yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
