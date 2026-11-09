export function jsonToCsv(json: string): string {
  try {
    const items = JSON.parse(json);
    if (!Array.isArray(items) || items.length === 0) return '';
    
    // Handle nested data if using generic records or special structures
    const processedItems = items.map(item => {
      if (item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
        return { id: item.id, ...item.data };
      }
      return item;
    });

    const replacer = (key: string, value: any) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    };
    
    const header = Object.keys(processedItems[0]);
    const csv = [
      header.join(','),
      ...processedItems.map((row: any) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      ),
    ].join('\r\n');

    return csv;
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    return '';
  }
}

/**
 * Converts dataset records into OpenAI ChatML / Vertex AI JSONL format:
 * {"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
 */
export function jsonToOpenAiJsonl(json: string, systemPrompt?: string): string {
  try {
    const items = JSON.parse(json);
    if (!Array.isArray(items) || items.length === 0) return '';

    const lines = items.map((item: any) => {
      const messages: Array<{ role: string; content: string }> = [];
      const defaultSystem = systemPrompt || 'You are an expert enterprise assistant trained on verified organizational guidelines.';
      messages.push({ role: 'system', content: defaultSystem });

      if (item.scenario_prompt) {
        messages.push({ role: 'user', content: item.scenario_prompt });
        messages.push({ role: 'assistant', content: item.chosen_response || item.answer || '' });
      } else if (item.question) {
        messages.push({ role: 'user', content: item.question });
        messages.push({ role: 'assistant', content: item.answer || '' });
      } else if (item.original_clause) {
        messages.push({ 
          role: 'user', 
          content: `Review the following ${item.clause_category || 'contract'} clause for compliance risk:\n\n${item.original_clause}` 
        });
        messages.push({ 
          role: 'assistant', 
          content: `Risk Level: ${item.risk_level}\n\nIssues Identified:\n${(item.identified_issues || []).map((i: string) => `- ${i}`).join('\n')}\n\nProposed Redline:\n${item.suggested_redline}\n\nLegal Justification:\n${item.legal_justification}` 
        });
      } else if (item.raw_text) {
        messages.push({ role: 'user', content: `Please provide verbalized spoken text and SSML markup for: ${item.raw_text}` });
        messages.push({ role: 'assistant', content: item.spoken_normalized_text || item.ssml_tagged_text || '' });
      } else if (item.prospect_objection) {
        messages.push({ role: 'user', content: item.prospect_objection });
        messages.push({ role: 'assistant', content: item.winning_rep_response || '' });
      } else {
        // Fallback for generic records
        messages.push({ role: 'user', content: `Analyze record: ${item.title || item.subject || item.id || 'N/A'}` });
        messages.push({ role: 'assistant', content: JSON.stringify(item) });
      }

      return JSON.stringify({ messages });
    });

    return lines.join('\n');
  } catch (error) {
    console.error('Error converting JSON to OpenAI JSONL:', error);
    return '';
  }
}

/**
 * Converts preference datasets to DPO (Direct Preference Optimization) JSONL:
 * {"prompt": "...", "chosen": "...", "rejected": "..."}
 */
export function jsonToDpoJsonl(json: string): string {
  try {
    const items = JSON.parse(json);
    if (!Array.isArray(items) || items.length === 0) return '';

    const lines = items
      .filter((item: any) => item.chosen_response || item.chosen)
      .map((item: any) => {
        return JSON.stringify({
          prompt: item.scenario_prompt || item.prompt || item.question || '',
          policy_clause: item.relevant_policy_clause || '',
          reasoning: item.reasoning || '',
          chosen: item.chosen_response || item.chosen || '',
          rejected: item.rejected_response || item.rejected || '',
          rejection_reason: item.rejection_reason || '',
        });
      });

    return lines.join('\n');
  } catch (error) {
    console.error('Error converting JSON to DPO JSONL:', error);
    return '';
  }
}

/**
 * Converts TTS datasets to standard LJSpeech format:
 * ID|raw_text|spoken_normalized_text
 */
export function jsonToLjSpeechCsv(json: string): string {
  try {
    const items = JSON.parse(json);
    if (!Array.isArray(items) || items.length === 0) return '';

    const lines = items.map((item: any) => {
      const id = item.id || `TTS_${Math.random().toString(36).substring(7)}`;
      const raw = (item.raw_text || item.text || '').replace(/[\r\n|]/g, ' ');
      const normalized = (item.spoken_normalized_text || item.text || raw).replace(/[\r\n|]/g, ' ');
      return `${id}|${raw}|${normalized}`;
    });

    return lines.join('\n');
  } catch (error) {
    console.error('Error converting JSON to LJSpeech format:', error);
    return '';
  }
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
