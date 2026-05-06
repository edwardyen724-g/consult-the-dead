'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';

export default function ApiKeyModal() {
  const show = useSettingsStore((s) => s.showApiKeyModal);
  const existingKey = useSettingsStore((s) => s.apiKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const closeModal = useSettingsStore((s) => s.closeApiKeyModal);
  const freeRemaining = useSettingsStore((s) => s.getFreeDebatesRemaining)();

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Populate input if key already exists (for editing)
  useEffect(() => {
    if (show && existingKey) {
      setInputValue(existingKey);
    }
  }, [show, existingKey]);

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Enter an API key or close this dialog to use free debates.');
      return;
    }
    if (!trimmed.startsWith('sk-ant-')) {
      setError('That doesn\u2019t look like an Anthropic API key. Keys start with sk-ant-');
      return;
    }
    setError('');
    setApiKey(trimmed);
  };

  const maskedKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.slice(0, 7) + '\u2022'.repeat(20) + key.slice(-4);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            className="w-full max-w-md mx-4 rounded-xl p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(20, 20, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="mb-5">
              <h2
                className="text-lg font-semibold tracking-tight"
                style={{ color: '#e4e4e7', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                Anthropic API Key
              </h2>
              <p
                className="mt-1 text-[13px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Add your own key for unlimited debates, or close this dialog to use your {freeRemaining} free debate{freeRemaining !== 1 ? 's' : ''} remaining today.
              </p>
            </div>

            {/* Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="sk-ant-api03-..."
                  autoFocus
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: error
                      ? '1px solid rgba(239,68,68,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: '#e4e4e7',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {showKey ? 'hide' : 'show'}
                </button>
              </div>
              {error && (
                <p className="mt-1.5 text-[12px]" style={{ color: 'rgba(239,68,68,0.8)' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Info */}
            <div
              className="mb-5 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <p>
                Get a key at{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  console.anthropic.com
                </a>
                . You pay Anthropic directly for API usage. This app has no subscription and takes no cut.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3">
              <div>
                {existingKey && (
                  <button
                    onClick={() => { setApiKey(null); setInputValue(''); }}
                    className="text-[11px] uppercase tracking-wider px-2 py-1 rounded transition-colors"
                    style={{ color: 'rgba(239,68,68,0.6)' }}
                  >
                    Remove key
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-[12px] uppercase tracking-wider transition-colors"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {existingKey ? 'Cancel' : 'Use free tier'}
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg px-5 py-2 text-[12px] uppercase tracking-wider font-medium transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#e4e4e7',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  Save key
                </button>
              </div>
            </div>

            {/* Current key indicator */}
            {existingKey && !inputValue && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Current key: <span className="font-mono">{maskedKey(existingKey)}</span>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
