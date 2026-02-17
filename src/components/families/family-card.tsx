'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentAvatar } from '@/components/agents/agent-avatar';
import { useAgentStore } from '@/stores/agent-store';
import type { Family } from '@/types/family';

interface FamilyCardProps {
  family: Family;
  onClick?: () => void;
  className?: string;
}

export function FamilyCard({ family, onClick, className }: FamilyCardProps) {
  const agents = useAgentStore((s) => s.agents);

  const memberAgents = family.members
    .map((m) => agents.find((a) => a.id === m.agentId))
    .filter(Boolean);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-4 rounded-xl border bg-card p-5 text-left transition-all',
        'hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'cursor-pointer w-full',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{family.emoji || '👨‍👩‍👧‍👦'}</span>
        <div>
          <h3 className="font-semibold text-card-foreground">{family.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3" />
            <span>
              {family.members.length} member{family.members.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {family.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {family.description}
        </p>
      )}

      {memberAgents.length > 0 && (
        <div className="flex items-center gap-1 -space-x-1.5">
          {memberAgents.map((agent) =>
            agent ? (
              <AgentAvatar
                key={agent.id}
                emoji={agent.emoji}
                color={agent.color}
                size="sm"
                className="ring-2 ring-card"
              />
            ) : null
          )}
        </div>
      )}

      {family.members.length === 0 && (
        <p className="text-xs italic text-muted-foreground/60">No members yet</p>
      )}
    </button>
  );
}
