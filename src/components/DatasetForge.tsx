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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  Download, Loader2, Sparkles, Database, FileJson, FileSpreadsheet, 
  CircleHelp, Tag, Type, Building2, Stethoscope, GraduationCap, 
  Activity, Save, BookOpen, Trash2, Star, Package, Ticket, HomeIcon,
  ChevronDown, Search, ShieldCheck, Scale, Terminal, Mic, PhoneCall,
  Copy, Check, AlertTriangle, ArrowRight, Volume2, Bot, Layers, Share2
} from "lucide-react";
import { generateStructuredDataset } from "@/ai/flows/generate-structured-dataset";
import { useToast } from "@/hooks/use-toast";
import { 
  jsonToCsv, 
  jsonToOpenAiJsonl, 
  jsonToDpoJsonl, 
  jsonToLjSpeechCsv, 
  downloadFile 
} from "@/lib/data-utils";
import { cn } from "@/lib/utils";

interface PromptTemplate {
  id: string;
  name: string;
  type: string;
  numRecords: number;
  description: string;
}

interface DatasetTypeOption {
  value: string;
  label: string;
  group: 'Corporate & Enterprise AI' | 'Voice & Speech AI' | 'Foundation Models' | 'Domain Specific';
  badge?: string;
  icon: React.ReactNode;
}

const DATASET_TYPES: DatasetTypeOption[] = [
  // Corporate & Enterprise AI
  { 
    value: 'corporate_policy_dpo', 
    label: 'Corporate Policy & Compliance (DPO)', 
    group: 'Corporate & Enterprise AI',
    badge: 'DPO/SFT',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> 
  },
  { 
    value: 'legal_contract_analysis', 
    label: 'Legal Contract Risk & Redlines', 
    group: 'Corporate & Enterprise AI',
    badge: 'Enterprise',
    icon: <Scale className="w-4 h-4 text-amber-600" /> 
  },
  { 
    value: 'it_incident_rca', 
    label: 'Enterprise IT / DevOps Incident RCA', 
    group: 'Corporate & Enterprise AI',
    badge: 'DevOps',
    icon: <Terminal className="w-4 h-4 text-blue-600" /> 
  },
  { 
    value: 'b2b_sales_dialogue', 
    label: 'B2B Sales Objection Handling', 
    group: 'Corporate & Enterprise AI',
    badge: 'Sales',
    icon: <Building2 className="w-4 h-4 text-purple-600" /> 
  },

  // Voice & Speech AI
  { 
    value: 'tts_speech_dataset', 
    label: 'Text-to-Speech (TTS) Normalization', 
    group: 'Voice & Speech AI',
    badge: 'Audio/TTS',
    icon: <Mic className="w-4 h-4 text-rose-600" /> 
  },
  { 
    value: 'voice_agent_dialogue', 
    label: 'Conversational Voicebot & Call Center', 
    group: 'Voice & Speech AI',
    badge: 'Voice AI',
    icon: <PhoneCall className="w-4 h-4 text-cyan-600" /> 
  },

  // Foundation Models
  { 
    value: 'qa', 
    label: 'Q&A Pairs', 
    group: 'Foundation Models',
    icon: <CircleHelp className="w-4 h-4" /> 
  },
  { 
    value: 'classification', 
    label: 'Text Classification', 
    group: 'Foundation Models',
    icon: <Tag className="w-4 h-4" /> 
  },
  { 
    value: 'text_label', 
    label: 'Multi-Label Text Tagging', 
    group: 'Foundation Models',
    icon: <Type className="w-4 h-4" /> 
  },
  { 
    value: 'company', 
    label: 'Company Profiles', 
    group: 'Foundation Models',
    icon: <Building2 className="w-4 h-4" /> 
  },
  { 
    value: 'records', 
    label: 'Generic Structured Records', 
    group: 'Foundation Models',
    icon: <Database className="w-4 h-4" /> 
  },

  // Domain Specific
  { 
    value: 'medical_diagnosis', 
    label: 'Clinical Diagnosis', 
    group: 'Domain Specific',
    icon: <Activity className="w-4 h-4" /> 
  },
  { 
    value: 'medical', 
    label: 'Medical Patient History', 
    group: 'Domain Specific',
    icon: <Stethoscope className="w-4 h-4" /> 
  },
  { 
    value: 'customer_review', 
    label: 'Customer Reviews & Sentiment', 
    group: 'Domain Specific',
    icon: <Star className="w-4 h-4" /> 
  },
  { 
    value: 'product_inventory', 
    label: 'Product Catalog & Inventory', 
    group: 'Domain Specific',
    icon: <Package className="w-4 h-4" /> 
  },
  { 
    value: 'support_ticket', 
    label: 'Customer Support Tickets', 
    group: 'Domain Specific',
    icon: <Ticket className="w-4 h-4" /> 
  },
  { 
    value: 'school', 
    label: 'Academic & Student Records', 
    group: 'Domain Specific',
    icon: <GraduationCap className="w-4 h-4" /> 
  },
  { 
    value: 'real_estate', 
    label: 'Real Estate Listings', 
    group: 'Domain Specific',
    icon: <HomeIcon className="w-4 h-4" /> 
  },
];

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: "tpl-corp-dpo",
    name: "Corporate Compliance & DPO Alignment",
    type: "corporate_policy_dpo",
    numRecords: 4,
    description: "Focus on Fortune 500 employee questions regarding AI usage, confidential documents, vendor gifting, and insider trading.",
  },
  {
    id: "tpl-legal-redline",
    name: "SaaS Agreement Legal Redlines",
    type: "legal_contract_analysis",
    numRecords: 3,
    description: "Focus on Enterprise SaaS agreements with strict limitation of liability, mutual IP indemnification, and SOC2 audit rights.",
  },
  {
    id: "tpl-tts-norm",
    name: "Financial IVR Text-to-Speech (TTS)",
    type: "tts_speech_dataset",
    numRecords: 4,
    description: "Generate banking and wealth management telephony scripts with complex numbers, account digits, dates, and SSML pause tags.",
  },
  {
    id: "tpl-voice-agent",
    name: "Flight Delay Call Center Voice Agent",
    type: "voice_agent_dialogue",
    numRecords: 2,
    description: "Multi-turn conversational dialogue with frustrated passengers rebooking delayed flights, with tone directions and natural backchanneling.",
  },
  {
    id: "tpl-it-rca",
    name: "Cloud DevOps Incident Postmortems",
    type: "it_incident_rca",
    numRecords: 3,
    description: "Production Sev-1/Sev-2 incidents covering Kubernetes OOM, Redis cache stampedes, and database deadlocks.",
  }
];

export default function DatasetForge() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [datasetType, setDatasetType] = useState('corporate_policy_dpo');
  const [numRecords, setNumRecords] = useState(4);
  const [description, setDescription] = useState('Enterprise compliance scenarios for training internal employee assistant');
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const [hygieneStats, setHygieneStats] = useState<any>(null);
  const [promptLibrary, setPromptLibrary] = useState<PromptTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'json'>('formatted');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dataset_forge_prompts');
    if (saved) {
      try {
        setPromptLibrary(JSON.parse(saved));
      } catch (e) {
        setPromptLibrary(DEFAULT_TEMPLATES);
      }
    } else {
      setPromptLibrary(DEFAULT_TEMPLATES);
      localStorage.setItem('dataset_forge_prompts', JSON.stringify(DEFAULT_TEMPLATES));
    }
  }, []);

  const saveToLibrary = () => {
    if (!templateName.trim()) {
      toast({ title: "Name required", description: "Please enter a name for the template." });
      return;
    }
    const newTemplate: PromptTemplate = {
      id: Date.now().toString(),
      name: templateName,
      type: datasetType,
      numRecords,
      description,
    };
    const updated = [newTemplate, ...promptLibrary];
    setPromptLibrary(updated);
    localStorage.setItem('dataset_forge_prompts', JSON.stringify(updated));
    setTemplateName('');
    toast({ title: "Saved to Library", description: `Template "${newTemplate.name}" saved.` });
  };

  const loadFromLibrary = (tpl: PromptTemplate) => {
    setDatasetType(tpl.type);
    setNumRecords(tpl.numRecords);
    setDescription(tpl.description);
    toast({ title: "Template Loaded", description: `Loaded "${tpl.name}"` });
  };

  const deleteFromLibrary = (id: string) => {
    const updated = promptLibrary.filter(p => p.id !== id);
    setPromptLibrary(updated);
    localStorage.setItem('dataset_forge_prompts', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedData(null);
    setHygieneStats(null);
    try {
      const result = await generateStructuredDataset({
        datasetType,
        numRecords,
        description
      });
      setGeneratedData(result.generatedData);
      setHygieneStats(result.hygieneStats || null);
      toast({ 
        title: "Generation Successful", 
        description: `Forged ${numRecords} clean records (${result.hygieneStats?.uniquenessScorePct || 100}% unique).` 
      });
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

  const copyToClipboard = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(generatedData);
    setCopied(true);
    toast({ title: "Copied!", description: "Dataset JSON copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
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

  const downloadAsOpenAiJsonl = () => {
    if (!generatedData) return;
    const jsonl = jsonToOpenAiJsonl(generatedData);
    downloadFile(jsonl, `dataset_sft_openai_${datasetType}_${Date.now()}.jsonl`, 'application/x-jsonlines');
    toast({ title: "Exported SFT JSONL", description: "Ready for OpenAI / Vertex AI fine-tuning." });
  };

  const downloadAsDpoJsonl = () => {
    if (!generatedData) return;
    const jsonl = jsonToDpoJsonl(generatedData);
    downloadFile(jsonl, `dataset_dpo_preference_${datasetType}_${Date.now()}.jsonl`, 'application/x-jsonlines');
    toast({ title: "Exported DPO JSONL", description: "Ready for Axolotl / HuggingFace alignment." });
  };

  const downloadAsLjSpeech = () => {
    if (!generatedData) return;
    const ljSpeech = jsonToLjSpeechCsv(generatedData);
    downloadFile(ljSpeech, `metadata_ljspeech_${Date.now()}.csv`, 'text/plain');
    toast({ title: "Exported LJSpeech CSV", description: "Ready for TTS audio training pipelines." });
  };

  const selectPreset = (val: string) => {
    setDatasetType(val);
    setIsPopoverOpen(false);
  };

  // Parse items for rich formatting
  const parsedRecords: any[] = React.useMemo(() => {
    if (!generatedData) return [];
    try {
      const parsed = JSON.parse(generatedData);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [generatedData]);

  const currentTypeMeta = DATASET_TYPES.find(t => t.value === datasetType);
  const isCorporateDpo = datasetType.includes('dpo') || datasetType.includes('compliance');
  const isLegal = datasetType.includes('legal');
  const isTts = datasetType.includes('tts') || datasetType.includes('speech');
  const isVoiceAgent = datasetType.includes('voice_agent');

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Banner / Feature Callout */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Next-Gen Dataset Engine</h4>
            <p className="text-xs text-muted-foreground">
              Enterprise Corporate DPO, Contract Redlines, TTS Audio Normalization & Call Center Voicebots.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            ✓ DPO / SFT Ready
          </Badge>
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            ✓ TTS Normalization
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            ✓ OpenAI / HuggingFace Export
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-indigo-100 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5 text-accent" />
                Forge Parameters
              </CardTitle>
              <CardDescription>Configure high-fidelity synthetic data generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Category Dropdown */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Dataset Category</Label>
                  {currentTypeMeta?.badge && (
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      {currentTypeMeta.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="e.g. corporate_policy_dpo, tts_speech_dataset..." 
                      value={datasetType}
                      onChange={(e) => setDatasetType(e.target.value)}
                      className="pr-10 font-mono text-sm"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" title="Browse Preset Catalog">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0" align="end">
                      <div className="p-3 border-b bg-muted/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Preset Category</p>
                      </div>
                      <div className="max-h-[380px] overflow-auto p-2 space-y-3">
                        {(['Corporate & Enterprise AI', 'Voice & Speech AI', 'Foundation Models', 'Domain Specific'] as const).map(groupName => {
                          const items = DATASET_TYPES.filter(t => t.group === groupName);
                          return (
                            <div key={groupName} className="space-y-1">
                              <p className="text-[11px] font-bold text-primary px-2 pt-1 uppercase tracking-wide">{groupName}</p>
                              {items.map(t => (
                                <button
                                  key={t.value}
                                  onClick={() => selectPreset(t.value)}
                                  className={cn(
                                    "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors hover:bg-secondary",
                                    datasetType === t.value && "bg-primary/10 text-primary font-semibold"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{t.icon}</span>
                                    <span>{t.label}</span>
                                  </div>
                                  {t.badge && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                                      {t.badge}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Number of Records */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Number of Records (1-50)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{numRecords} records</span>
                </div>
                <Input 
                  type="number" 
                  min={1} 
                  max={50} 
                  value={numRecords} 
                  onChange={(e) => setNumRecords(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Requirements / Context */}
              <div className="space-y-2">
                <Label>Domain Context & Specific Guidelines</Label>
                <Textarea 
                  placeholder="e.g. Focus on financial services, compliance with GDPR/SOC2, and strict anti-bribery policies..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[110px] text-sm"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              <Button 
                onClick={handleGenerate} 
                disabled={loading} 
                className="w-full h-12 text-base font-headline shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Forging High-Fidelity Dataset...
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
                  placeholder="Save current prompt as..." 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1 text-xs"
                />
                <Button variant="outline" size="icon" onClick={saveToLibrary} title="Save to Library">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Prompt Library */}
          <Card className="shadow-md border-indigo-100 bg-white/90 backdrop-blur-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-primary text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Prompt Presets Library
              </CardTitle>
              <CardDescription className="text-xs">One-click enterprise and voice dataset configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-auto">
              {promptLibrary.map((tpl) => (
                <div 
                  key={tpl.id} 
                  className="group flex items-center justify-between p-2.5 rounded-lg border bg-secondary/15 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex flex-col cursor-pointer flex-1 mr-2" onClick={() => loadFromLibrary(tpl)}>
                    <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">{tpl.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{tpl.type} • {tpl.numRecords} recs</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-50 group-hover:opacity-100 text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteFromLibrary(tpl.id); }}
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results & Specialized Views */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-xl border-indigo-100 min-h-[550px] flex flex-col bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <CardTitle className="text-primary flex items-center gap-2 text-lg">
                  <Database className="w-5 h-5 text-accent" />
                  Output Console
                </CardTitle>
                <CardDescription className="text-xs">
                  {parsedRecords.length > 0 
                    ? `Generated ${parsedRecords.length} records ready for preview and export`
                    : 'Configure parameters and generate your dataset'
                  }
                </CardDescription>
              </div>

              {generatedData && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} title="Copy JSON">
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    Copy
                  </Button>

                  {/* Standard Export */}
                  <Button variant="secondary" size="sm" onClick={downloadAsJson}>
                    <FileJson className="w-3.5 h-3.5 mr-1" />
                    JSON
                  </Button>
                  <Button variant="secondary" size="sm" onClick={downloadAsCsv}>
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                    CSV
                  </Button>

                  {/* Specialized AI Fine-Tuning Exports */}
                  <Button variant="default" size="sm" onClick={downloadAsOpenAiJsonl} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    SFT JSONL
                  </Button>

                  {isCorporateDpo && (
                    <Button variant="outline" size="sm" onClick={downloadAsDpoJsonl} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      DPO JSONL
                    </Button>
                  )}

                  {isTts && (
                    <Button variant="outline" size="sm" onClick={downloadAsLjSpeech} className="border-rose-300 text-rose-700 hover:bg-rose-50">
                      <Mic className="w-3.5 h-3.5 mr-1" />
                      LJSpeech CSV
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 p-6 relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-background/60 backdrop-blur-sm z-10 rounded-md">
                  <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-foreground">Forging High-Fidelity Dataset...</p>
                    <p className="text-xs text-muted-foreground">Synthesizing realistic enterprise & speech records</p>
                  </div>
                </div>
              ) : generatedData ? (
                <div className="space-y-4">
                  {/* Dataset Health & Hygiene Scorecard */}
                  {hygieneStats && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-emerald-50/70 border-emerald-200 text-xs text-emerald-950 shadow-sm animate-in fade-in duration-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">Dataset Health Scorecard:</span>
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-mono font-bold text-[11px]">
                          {hygieneStats.uniquenessScorePct}% Unique
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-emerald-900/80 text-[11px] font-medium">
                        <span>✓ {hygieneStats.exactDuplicatesRemoved + hygieneStats.nearDuplicatesRemoved} duplicates pruned</span>
                        <span>•</span>
                        <span>✓ {hygieneStats.hygieneFixesApplied} formatting sanitizations</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">✓ 1.3x over-generation buffer active</span>
                      </div>
                    </div>
                  )}

                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <div className="flex items-center justify-between pb-2">
                      <TabsList className="grid grid-cols-2 w-[240px]">
                        <TabsTrigger value="formatted">Rich View</TabsTrigger>
                        <TabsTrigger value="json">Raw JSON</TabsTrigger>
                      </TabsList>
                      <span className="text-xs text-muted-foreground font-mono">
                        {parsedRecords.length} items
                      </span>
                    </div>

                    {/* Rich View Tab */}
                    <TabsContent value="formatted" className="mt-2 space-y-4 max-h-[600px] overflow-auto pr-1">
                      
                      {/* DPO / Corporate Policy View */}
                      {isCorporateDpo && (
                        <div className="space-y-4">
                          {parsedRecords.map((item, idx) => (
                            <div key={item.id || idx} className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                                <span className="font-mono text-xs font-bold text-primary">{item.id || `DPO-${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  {item.policy_domain && <Badge variant="outline">{item.policy_domain}</Badge>}
                                  <Badge className={cn(
                                    item.risk_level === 'critical' ? 'bg-red-500' :
                                    item.risk_level === 'high' ? 'bg-orange-500' :
                                    item.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                  )}>
                                    Risk: {item.risk_level || 'standard'}
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Workplace Scenario / Prompt</p>
                                <p className="text-sm font-medium text-foreground mt-0.5">{item.scenario_prompt}</p>
                              </div>

                              {item.relevant_policy_clause && (
                                <div className="p-2.5 rounded bg-muted/50 border text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">Policy Grounding: </span>
                                  {item.relevant_policy_clause}
                                </div>
                              )}

                              {item.reasoning && (
                                <div className="text-xs text-muted-foreground italic border-l-2 border-indigo-400 pl-3">
                                  <span className="font-semibold not-italic">Reasoning / CoT: </span>
                                  {item.reasoning}
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    CHOSEN (Compliant)
                                  </div>
                                  <p className="text-xs text-emerald-950 leading-relaxed">{item.chosen_response}</p>
                                </div>

                                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                    REJECTED (Non-Compliant)
                                  </div>
                                  <p className="text-xs text-rose-950 leading-relaxed">{item.rejected_response}</p>
                                  {item.rejection_reason && (
                                    <p className="text-[11px] text-rose-700 italic border-t border-rose-200 pt-1">
                                      Why Rejected: {item.rejection_reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Legal Contract View */}
                      {isLegal && (
                        <div className="space-y-4">
                          {parsedRecords.map((item, idx) => (
                            <div key={item.id || idx} className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-amber-600" />
                                  <span className="font-semibold text-sm">{item.clause_category}</span>
                                </div>
                                <Badge className={cn(
                                  item.risk_level === 'unacceptable' ? 'bg-red-600' :
                                  item.risk_level === 'high_risk' ? 'bg-orange-500' : 'bg-amber-500'
                                )}>
                                  {item.risk_level}
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground">Original Clause:</span>
                                <p className="text-xs font-mono bg-muted/40 p-2.5 rounded border text-foreground">{item.original_clause}</p>
                              </div>

                              {item.identified_issues && item.identified_issues.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-xs font-semibold text-destructive">Identified Legal Issues:</span>
                                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                                    {item.identified_issues.map((issue: string, i: number) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-emerald-700">Proposed Redline:</span>
                                <p className="text-xs font-mono bg-emerald-50/50 p-2.5 rounded border border-emerald-200 text-emerald-950">
                                  {item.suggested_redline}
                                </p>
                              </div>

                              {item.legal_justification && (
                                <p className="text-xs text-muted-foreground italic border-t pt-2">
                                  <span className="font-semibold not-italic">Justification: </span>
                                  {item.legal_justification}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TTS / Speech View */}
                      {isTts && (
                        <div className="space-y-4">
                          {parsedRecords.map((item, idx) => (
                            <div key={item.id || idx} className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                                <div className="flex items-center gap-2">
                                  <Volume2 className="w-4 h-4 text-rose-500" />
                                  <span className="font-semibold text-xs text-foreground">{item.domain_category || 'Speech Script'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {item.target_emotion && (
                                    <Badge variant="secondary" className="text-[10px] capitalize">
                                      {item.target_emotion}
                                    </Badge>
                                  )}
                                  {item.speaking_rate_wpm && (
                                    <span className="text-[10px] text-muted-foreground font-mono">{item.speaking_rate_wpm} wpm</span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Raw Written Text</span>
                                  <p className="text-xs p-3 rounded-lg bg-muted/40 border leading-relaxed">{item.raw_text}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-rose-700 uppercase">Spoken Normalized Text</span>
                                  <p className="text-xs p-3 rounded-lg bg-rose-50/40 border border-rose-200 text-rose-950 leading-relaxed font-medium">
                                    {item.spoken_normalized_text}
                                  </p>
                                </div>
                              </div>

                              {item.ssml_tagged_text && (
                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase">SSML Markup</span>
                                  <pre className="text-[11px] p-2.5 rounded bg-slate-950 text-slate-100 font-mono overflow-auto max-h-24">
                                    {item.ssml_tagged_text}
                                  </pre>
                                </div>
                              )}

                              {item.phonetic_notes && item.phonetic_notes.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1 border-t">
                                  <span className="text-[11px] font-semibold text-muted-foreground">Phonetics:</span>
                                  {item.phonetic_notes.map((note: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-[10px] font-mono">
                                      {note.term} → {note.pronunciation}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Voice Agent Multi-Turn View */}
                      {isVoiceAgent && (
                        <div className="space-y-4">
                          {parsedRecords.map((item, idx) => (
                            <div key={item.id || idx} className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-semibold text-sm text-primary">{item.call_context}</span>
                                {item.customer_mood && (
                                  <Badge variant="outline" className="capitalize text-xs">
                                    Mood: {item.customer_mood}
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-2 py-2">
                                {(item.dialogue_turns || []).map((turn: any, tIdx: number) => (
                                  <div 
                                    key={tIdx} 
                                    className={cn(
                                      "flex flex-col p-2.5 rounded-lg max-w-[85%] text-xs space-y-1",
                                      turn.speaker === 'agent' 
                                        ? "ml-auto bg-primary/10 border border-primary/20 text-primary-foreground" 
                                        : "mr-auto bg-secondary border text-foreground"
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-2 text-[10px] font-semibold opacity-70">
                                      <span>{turn.speaker === 'agent' ? '🤖 Voice Agent' : '👤 Customer'}</span>
                                      {turn.tone_direction && <span className="italic">{turn.tone_direction}</span>}
                                    </div>
                                    <p className="text-foreground text-xs leading-relaxed">{turn.text}</p>
                                  </div>
                                ))}
                              </div>

                              {item.call_resolution && (
                                <div className="border-t pt-2 text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">Resolution: </span>
                                  {item.call_resolution}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Generic Tabular View for all other datasets */}
                      {!isCorporateDpo && !isLegal && !isTts && !isVoiceAgent && (
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                {Object.keys(parsedRecords[0] || {}).slice(0, 5).map((col) => (
                                  <TableHead key={col} className="capitalize text-xs font-bold">{col}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {parsedRecords.map((row, rIdx) => (
                                <TableRow key={rIdx}>
                                  {Object.keys(parsedRecords[0] || {}).slice(0, 5).map((col) => (
                                    <TableCell key={col} className="text-xs font-mono max-w-[200px] truncate">
                                      {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    {/* Raw JSON View Tab */}
                    <TabsContent value="json" className="mt-2">
                      <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[500px] border shadow-inner">
                        <pre>{generatedData}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4 border-2 border-dashed rounded-lg">
                  <Database className="w-12 h-12 opacity-20" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Ready to Forge Synthetic Data</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Select a category on the left (e.g. Corporate Policy DPO, Legal Redlines, or TTS Audio) and hit Generate.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
