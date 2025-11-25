import { useState, useEffect } from 'react';
import { legalDocumentsApi } from '../api/api';
import {
  cacheTermsDocument,
  getCachedTermsDocument,
  cachePrivacyDocument,
  getCachedPrivacyDocument,
} from '../../../services/storage';
import type { LegalDocument, DocumentVersion } from '../domain/entities';

export function useTermsAndConditions() {
  const [content, setContent] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const loadTerms = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Show cached content immediately (for fast UX)
      if (!forceRefresh) {
        const cached = await getCachedTermsDocument();
        if (cached) {
          setContent(cached.content);
          setVersion(cached.version);
          setIsCached(true);
        }
      }

      // 2. Check current version from server
      const serverVersion = await legalDocumentsApi.getTermsVersion();

      // 3. If version changed or no cache, fetch new content
      const cached = await getCachedTermsDocument();
      if (forceRefresh || !cached || cached.version !== serverVersion.version) {
        const document = await legalDocumentsApi.getTerms();
        setContent(document.content);
        setVersion(document.version);
        setIsCached(false);

        // Update cache
        await cacheTermsDocument(
          document.content,
          document.version,
          document.lastUpdated
        );
      } else {
        // Version matches, use cached content
        setVersion(cached.version);
      }
    } catch (err: any) {
      console.error('Error loading terms:', err);
      setError(err.message || 'Failed to load Terms & Conditions');

      // Fallback to cached content if available
      const cached = await getCachedTermsDocument();
      if (cached) {
        setContent(cached.content);
        setVersion(cached.version);
        setIsCached(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  return {
    content,
    version,
    loading,
    error,
    isCached,
    refresh: () => loadTerms(true),
  };
}

export function usePrivacyPolicy() {
  const [content, setContent] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const loadPrivacy = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Show cached content immediately
      if (!forceRefresh) {
        const cached = await getCachedPrivacyDocument();
        if (cached) {
          setContent(cached.content);
          setVersion(cached.version);
          setIsCached(true);
        }
      }

      // 2. Check current version from server
      const serverVersion = await legalDocumentsApi.getPrivacyVersion();

      // 3. If version changed or no cache, fetch new content
      const cached = await getCachedPrivacyDocument();
      if (forceRefresh || !cached || cached.version !== serverVersion.version) {
        const document = await legalDocumentsApi.getPrivacy();
        setContent(document.content);
        setVersion(document.version);
        setIsCached(false);

        // Update cache
        await cachePrivacyDocument(
          document.content,
          document.version,
          document.lastUpdated
        );
      } else {
        setVersion(cached.version);
      }
    } catch (err: any) {
      console.error('Error loading privacy:', err);
      setError(err.message || 'Failed to load Privacy Policy');

      // Fallback to cached content
      const cached = await getCachedPrivacyDocument();
      if (cached) {
        setContent(cached.content);
        setVersion(cached.version);
        setIsCached(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivacy();
  }, []);

  return {
    content,
    version,
    loading,
    error,
    isCached,
    refresh: () => loadPrivacy(true),
  };
}

