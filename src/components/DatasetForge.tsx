"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, Loader2, Sparkles, Database, FileJson, FileSpreadsheet, 
  CircleHelp, Tag, Type, Building2, Stethoscope, GraduationCap, 
  Activity, Save, BookOpen, Trash2, Star, Package, Ticket, HomeIcon,
  ChevronDown, Search
} from "lucide-react";
import { generateStructuredDataset } from "@/ai/flows/generate-structured-dataset";
import { useToast } from "@/hooks/use-toast";
import { jsonToCsv, downloadFile } from "@/lib/data-utils";
import { cn } from "@/lib/utils";

interface PromptTemplate {
  id: string;
  name: string;
  type: string;
  numRecords: number;
  description: string;
}

const DATASET_TYPES = [
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
  const [datasetType, setDatasetType] = useState('company');
  const [numRecords, setNumRecords] = useState(5);
  const [description, setDescription] = useState('');
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const [promptLibrary, setPromptLibrary] = useState<PromptTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
      const result = await generateStructuredDataset({
        datasetType,
        numRecords,
        description
      });
      setGeneratedData(result.generatedData);
      toast({ title: "Generation Successful", description: `Generated ${numRecords} records.` });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: error.message || "An unexpected error occurred." 
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsJson = () => {
    if (!generatedData) return;
    downloadFile(generatedData, `dataset_${datasetType.replace(/\s+/g, '_')}_${Date.now()}.json`, 'application/json');
  };

  const downloadAsCsv = () => {
    if (!generatedData) return;
    const csvContent = jsonToCsv(generatedData);
    downloadFile(csvContent, `dataset_${datasetType.replace(/\s+/g, '_')}_${Date.now()}.csv`, 'text/csv');
  };

  const selectPreset = (val: string) => {
    setDatasetType(val);
    setIsPopoverOpen(false);
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
              <CardDescription>Configure your high-speed generation engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Dataset Category (Select or Type)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="e.g. Clinical Trials, Tweets, Luxury Hotels..." 
                      value={datasetType}
                      onChange={(e) => setDatasetType(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" title="Quick Select Preset">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="end">
                      <div className="p-2 border-b bg-secondary/20">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">Common Presets</p>
                      </div>
                      <div className="max-h-[300px] overflow-auto p-1">
                        {DATASET_TYPES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => selectPreset(t.value)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors hover:bg-secondary",
                              datasetType === t.value && "bg-primary/5 text-primary font-medium"
                            )}
                          >
                            <span className="text-accent">{t.icon}</span>
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
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
              
              <div className="flex w-full gap-2 border-t pt-3 mt-1">
                <Input 
                  placeholder="Save template as..." 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={saveToLibrary} title="Save to Library">
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
                <CardDescription>Live preview of your synthetic data.</CardDescription>
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
                  <p className="text-sm font-medium animate-pulse">Generating high-fidelity records...</p>
                </div>
              ) : generatedData ? (
                <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[500px] border shadow-inner">
                  <pre>{generatedData}</pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4 border-2 border-dashed rounded-lg">
                  <Database className="w-12 h-12 opacity-20" />
                  <p>Configure parameters and click generate to see results.</p>
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
              <CardDescription>Reuse your successful configurations.</CardDescription>
            </CardHeader>
            <CardContent>
              {promptLibrary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {promptLibrary.map((tpl) => (
                    <div 
                      key={tpl.id} 
                      className="group flex items-center justify-between p-3 rounded-md border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex flex-col cursor-pointer flex-1" onClick={() => loadFromLibrary(tpl)}>
                        <span className="font-semibold text-sm">{tpl.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{tpl.type} • {tpl.numRecords} recs</span>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); deleteFromLibrary(tpl.id); }}>
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
