import type { AISummary, SeverityLevel, SourceType, UnifiedEvent } from '../types/vanguard';

export interface ParsedQueryFilter {
  sourceType?: SourceType;
  severity?: SeverityLevel;
  minConfidence?: number;
  searchKeyword?: string;
  hasAnomaly?: boolean;
  explanation: string;
}

// Client-side structured NLP Query Parser (with Gemini-compatible intent schema)
export function parseNaturalLanguageQuery(query: string): ParsedQueryFilter {
  const q = query.toLowerCase().trim();
  const filter: ParsedQueryFilter = {
    explanation: `Applied filter for "${query}"`
  };

  // Detect Source
  if (q.includes('radar') || q.includes('bogey') || q.includes('track') || q.includes('contact')) {
    filter.sourceType = 'radar';
  } else if (q.includes('weather') || q.includes('wind') || q.includes('storm') || q.includes('turbulence')) {
    filter.sourceType = 'weather';
  } else if (q.includes('personnel') || q.includes('asset') || q.includes('unit') || q.includes('s-400') || q.includes('squad')) {
    filter.sourceType = 'personnel';
  } else if (q.includes('log') || q.includes('tripwire') || q.includes('sensor') || q.includes('jamming')) {
    filter.sourceType = 'log';
  } else if (q.includes('incident') || q.includes('bunker') || q.includes('dispatch') || q.includes('threat')) {
    filter.sourceType = 'incident';
  }

  // Detect Severity
  if (q.includes('critical') || q.includes('urgent') || q.includes('danger')) {
    filter.severity = 'critical';
  } else if (q.includes('high')) {
    filter.severity = 'high';
  } else if (q.includes('medium') || q.includes('moderate')) {
    filter.severity = 'medium';
  } else if (q.includes('low')) {
    filter.severity = 'low';
  }

  // Detect Confidence
  if (q.includes('high confidence') || q.includes('> 80') || q.includes('verified')) {
    filter.minConfidence = 80;
  } else if (q.includes('low confidence') || q.includes('< 50') || q.includes('unconfirmed')) {
    filter.minConfidence = 30;
  }

  // Detect Anomaly
  if (q.includes('anomaly') || q.includes('unusual') || q.includes('spike')) {
    filter.hasAnomaly = true;
  }

  // Search keyword extraction
  const tokens = q.split(/\s+/).filter(t => !['show', 'all', 'the', 'in', 'on', 'with', 'filter', 'contacts', 'events', 'highlights'].includes(t));
  if (tokens.length > 0) {
    filter.searchKeyword = tokens[0];
  }

  return filter;
}

// Voice synthesizer - Audio Disabled
export class MilitaryVoiceSynthesizer {
  public speak(_text: string, _onStart?: () => void, onEnd?: () => void) {
    if (onEnd) onEnd();
  }

  public stop() {}

  public getSpeakingStatus(): boolean {
    return false;
  }
}

export const voiceSynthesizer = new MilitaryVoiceSynthesizer();
