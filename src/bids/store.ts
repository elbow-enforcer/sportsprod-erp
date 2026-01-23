/**
 * @file store.ts
 * @description Zustand store for Bids/Quotes state management
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { create } from 'zustand';
import type {
  ManufacturerQuote,
  BidStatus,
  ParsedField,
  ParseConfidence,
} from './types';
import { parseQuoteEmail, type EmailInput } from './emailParser';
import { mockQuotes } from './mockData';

interface BidsState {
  // Data
  quotes: ManufacturerQuote[];
  
  // UI State
  selectedQuoteId: string | null;
  filterStatus: BidStatus | 'all';
  searchTerm: string;
  
  // Actions
  // eslint-disable-next-line no-unused-vars
  importFromEmail: (email: EmailInput) => ManufacturerQuote;
  // eslint-disable-next-line no-unused-vars
  importMultipleEmails: (emails: EmailInput[]) => ManufacturerQuote[];
  updateQuote: (id: string, updates: Partial<ManufacturerQuote>) => void;
  updateParsedField: <T>(
    quoteId: string,
    fieldName: keyof ManufacturerQuote,
    value: T,
    confidence?: ParseConfidence
  ) => void;
  deleteQuote: (id: string) => void;
  setSelectedQuote: (id: string | null) => void;
  setFilterStatus: (status: BidStatus | 'all') => void;
  setSearchTerm: (term: string) => void;
  
  // Status management
  markAsReviewed: (id: string, reviewedBy: string) => void;
  acceptQuote: (id: string) => void;
  rejectQuote: (id: string, reason?: string) => void;
  
  // Computed / Getters
  getQuoteById: (id: string) => ManufacturerQuote | undefined;
  getFilteredQuotes: () => ManufacturerQuote[];
  getQuotesBySupplier: (supplierId: string) => ManufacturerQuote[];
  getQuoteStats: () => {
    total: number;
    byStatus: Record<BidStatus, number>;
    avgConfidence: number;
  };
}

function generateId(): string {
  return `bid-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate overall confidence from parsed fields
 */
function recalculateConfidence(quote: ManufacturerQuote): ParseConfidence {
  const fields = [
    quote.unitCost?.confidence,
    quote.moq?.confidence,
    quote.leadTimeDays?.confidence,
    quote.paymentTerms?.confidence,
  ].filter(Boolean) as ParseConfidence[];
  
  if (fields.length === 0) return 'low';
  
  const scores = { high: 3, medium: 2, low: 1, manual: 3 };
  const avgScore = fields.reduce((sum, c) => sum + scores[c], 0) / fields.length;
  
  if (avgScore >= 2.5) return 'high';
  if (avgScore >= 1.5) return 'medium';
  return 'low';
}

export const useBidsStore = create<BidsState>((set, get) => ({
  // Initial data
  quotes: mockQuotes,
  selectedQuoteId: null,
  filterStatus: 'all',
  searchTerm: '',
  
  // Import from email
  importFromEmail: (email: EmailInput) => {
    const result = parseQuoteEmail(email);
    const now = Date.now();
    
    const newQuote: ManufacturerQuote = {
      id: generateId(),
      supplierId: undefined,
      supplierName: result.quote.supplierName || 'Unknown Supplier',
      supplierEmail: result.quote.supplierEmail || email.from,
      unitCost: result.quote.unitCost || { value: null, confidence: 'low', originalText: '', manuallyEdited: false },
      moq: result.quote.moq || { value: null, confidence: 'low', originalText: '', manuallyEdited: false },
      leadTimeDays: result.quote.leadTimeDays || { value: null, confidence: 'low', originalText: '', manuallyEdited: false },
      toolingCosts: result.quote.toolingCosts || { value: null, confidence: 'low', originalText: '', manuallyEdited: false },
      paymentTerms: result.quote.paymentTerms || { value: null, confidence: 'low', originalText: '', manuallyEdited: false },
      currency: result.quote.currency || 'USD',
      productDescription: result.quote.productDescription || email.subject,
      validUntil: result.quote.validUntil,
      emailSubject: email.subject,
      emailBody: email.body,
      emailReceivedAt: email.receivedAt,
      emailFrom: email.from,
      status: 'parsed',
      overallConfidence: result.quote.overallConfidence || 'low',
      notes: result.warnings.length > 0 ? `Parsing warnings:\n${result.warnings.join('\n')}` : '',
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => ({
      quotes: [...state.quotes, newQuote],
    }));
    
    return newQuote;
  },
  
  importMultipleEmails: (emails: EmailInput[]) => {
    const newQuotes: ManufacturerQuote[] = [];
    const { importFromEmail } = get();
    
    for (const email of emails) {
      newQuotes.push(importFromEmail(email));
    }
    
    return newQuotes;
  },
  
  updateQuote: (id: string, updates: Partial<ManufacturerQuote>) => {
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id
          ? { ...q, ...updates, updatedAt: Date.now() }
          : q
      ),
    }));
  },
  
  updateParsedField: <T>(
    quoteId: string,
    fieldName: keyof ManufacturerQuote,
    value: T,
    confidence: ParseConfidence = 'manual'
  ) => {
    set((state) => {
      const updatedQuotes = state.quotes.map((q) => {
        if (q.id !== quoteId) return q;
        
        const existingField = q[fieldName] as ParsedField<T> | undefined;
        const updatedField: ParsedField<T> = {
          value,
          confidence,
          originalText: existingField?.originalText || '',
          manuallyEdited: true,
        };
        
        const updatedQuote = {
          ...q,
          [fieldName]: updatedField,
          updatedAt: Date.now(),
        };
        
        // Recalculate overall confidence
        updatedQuote.overallConfidence = recalculateConfidence(updatedQuote);
        
        return updatedQuote;
      });
      
      return { quotes: updatedQuotes };
    });
  },
  
  deleteQuote: (id: string) => {
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== id),
      selectedQuoteId: state.selectedQuoteId === id ? null : state.selectedQuoteId,
    }));
  },
  
  setSelectedQuote: (id: string | null) => {
    set({ selectedQuoteId: id });
  },
  
  setFilterStatus: (status: BidStatus | 'all') => {
    set({ filterStatus: status });
  },
  
  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },
  
  markAsReviewed: (id: string, reviewedBy: string) => {
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'reviewed' as BidStatus,
              reviewedBy,
              reviewedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : q
      ),
    }));
  },
  
  acceptQuote: (id: string) => {
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id
          ? { ...q, status: 'accepted' as BidStatus, updatedAt: Date.now() }
          : q
      ),
    }));
  },
  
  rejectQuote: (id: string, reason?: string) => {
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'rejected' as BidStatus,
              notes: reason ? `${q.notes}\n\nRejection reason: ${reason}` : q.notes,
              updatedAt: Date.now(),
            }
          : q
      ),
    }));
  },
  
  getQuoteById: (id: string) => {
    return get().quotes.find((q) => q.id === id);
  },
  
  getFilteredQuotes: () => {
    const { quotes, filterStatus, searchTerm } = get();
    
    return quotes.filter((q) => {
      // Status filter
      if (filterStatus !== 'all' && q.status !== filterStatus) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          q.supplierName.toLowerCase().includes(term) ||
          q.supplierEmail.toLowerCase().includes(term) ||
          q.productDescription.toLowerCase().includes(term) ||
          q.emailSubject.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  },
  
  getQuotesBySupplier: (supplierId: string) => {
    return get().quotes.filter((q) => q.supplierId === supplierId);
  },
  
  getQuoteStats: () => {
    const quotes = get().quotes;
    const byStatus: Record<BidStatus, number> = {
      draft: 0,
      parsed: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
    };
    
    const confidenceScores = { high: 3, medium: 2, low: 1, manual: 3 };
    let totalConfidence = 0;
    
    for (const q of quotes) {
      byStatus[q.status]++;
      totalConfidence += confidenceScores[q.overallConfidence];
    }
    
    return {
      total: quotes.length,
      byStatus,
      avgConfidence: quotes.length > 0 ? totalConfidence / quotes.length : 0,
    };
  },
}));
