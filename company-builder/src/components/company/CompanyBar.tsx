'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCompanyStore } from '@/store/companyStore';

export default function CompanyBar() {
  const company = useCompanyStore((s) => s.company);
  const setCompanyName = useCompanyStore((s) => s.setCompanyName);
  const setCompanyMission = useCompanyStore((s) => s.setCompanyMission);
  const placedMinds = useCompanyStore((s) => s.placedMinds);

  const [editingName, setEditingName] = useState(false);
  const [editingMission, setEditingMission] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const missionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingMission && missionRef.current) {
      missionRef.current.focus();
      missionRef.current.select();
    }
  }, [editingMission]);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 pointer-events-none"
      style={{ zIndex: 15 }}
    >
      {/* Company info — left-aligned, offset for sidebar */}
      <div className="pointer-events-auto ml-4">
        <div className="glass-panel rounded-xl px-5 py-3 inline-block">
          {/* Company name */}
          {editingName ? (
            <input
              ref={nameRef}
              type="text"
              value={company.name}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="text-[22px] font-bold tracking-wide bg-transparent border-none outline-none w-full"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#e4e4e7',
                caretColor: '#e4e4e7',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingName(true)}
              className="text-[22px] font-bold tracking-wide cursor-text transition-colors hover:text-white"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#e4e4e7',
              }}
            >
              {company.name}
            </div>
          )}

          {/* Mission */}
          {editingMission ? (
            <input
              ref={missionRef}
              type="text"
              value={company.mission}
              onChange={(e) => setCompanyMission(e.target.value)}
              onBlur={() => setEditingMission(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingMission(false)}
              className="text-[12px] tracking-wide bg-transparent border-none outline-none w-full mt-0.5"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#a1a1aa',
                caretColor: '#a1a1aa',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingMission(true)}
              className="text-[12px] tracking-wide cursor-text transition-colors hover:text-[#a1a1aa] mt-0.5"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#71717a',
              }}
            >
              {company.mission}
            </div>
          )}
        </div>
      </div>

      {/* Node count -- right */}
      <div className="pointer-events-auto">
        <div className="glass-panel rounded-lg px-3 py-1.5">
          <span
            className="text-[10px] uppercase tracking-[0.15em]"
            style={{
              color: placedMinds.length > 0 ? '#71717a' : '#52525b',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            {placedMinds.length} mind{placedMinds.length !== 1 ? 's' : ''} deployed
          </span>
        </div>
      </div>
    </div>
  );
}
