import { Role } from '@/types';

export const roles: Role[] = [
  {
    id: 'ceo',
    label: 'Chief Executive Officer',
    shortLabel: 'CEO',
    color: '#e8e8ec',
    description: 'Sets vision and strategy. The final decision-maker.',
  },
  {
    id: 'cto',
    label: 'Chief Technology Officer',
    shortLabel: 'CTO',
    color: '#5BA3CF',
    description: 'Leads technology vision and architecture.',
  },
  {
    id: 'cmo',
    label: 'Chief Marketing Officer',
    shortLabel: 'CMO',
    color: '#D4A843',
    description: 'Owns brand, positioning, and growth.',
  },
  {
    id: 'cfo',
    label: 'Chief Financial Officer',
    shortLabel: 'CFO',
    color: '#7A7A7A',
    description: 'Guards capital and financial strategy.',
  },
  {
    id: 'coo',
    label: 'Chief Operating Officer',
    shortLabel: 'COO',
    color: '#B8656B',
    description: 'Runs day-to-day operations and execution.',
  },
  {
    id: 'vp_engineering',
    label: 'VP Engineering',
    shortLabel: 'VP ENG',
    color: '#4ECDC4',
    description: 'Leads engineering teams and delivery.',
  },
  {
    id: 'vp_sales',
    label: 'VP Sales',
    shortLabel: 'VP SALES',
    color: '#C77DB2',
    description: 'Drives revenue and customer acquisition.',
  },
  {
    id: 'vp_product',
    label: 'VP Product',
    shortLabel: 'VP PRODUCT',
    color: '#E8985E',
    description: 'Defines what gets built and why.',
  },
  {
    id: 'head_rd',
    label: 'Head of R&D',
    shortLabel: 'R&D',
    color: '#6B8DD6',
    description: 'Pushes the frontier of what is possible.',
  },
  {
    id: 'head_strategy',
    label: 'Head of Strategy',
    shortLabel: 'STRATEGY',
    color: '#8B7355',
    description: 'Maps competitive landscape and long-term plays.',
  },
  {
    id: 'head_operations',
    label: 'Head of Operations',
    shortLabel: 'OPS',
    color: '#9B8EC4',
    description: 'Keeps the machine running at scale.',
  },
  {
    id: 'advisor',
    label: 'Advisor',
    shortLabel: 'ADVISOR',
    color: '#7B9E6B',
    description: 'Provides counsel without operational burden.',
  },
];

export const rolesMap = new Map(roles.map((r) => [r.id, r]));
