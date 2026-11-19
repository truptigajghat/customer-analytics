import React, { useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MessageSquare, RotateCcw, Send } from 'lucide-react';
import {
  CHART_COLORS,
  RECHARTS_AXIS_TICK,
  RECHARTS_TOOLTIP_STYLE,
} from '../components/charts/chartTheme';
import { ChartCard } from '../components/common/ChartCard';
import { DemoNotice } from '../components/common/DemoNotice';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import {
  SUGGESTED_INSIGHT_QUESTIONS,
  getDemoAssistantReply,
} from '../data/mockAnalytics';
import { useAsyncData } from '../hooks/useAsyncData';
import { getBusinessInsights } from '../services/analyticsService';
import type { InsightChatMessage } from '../types/prediction';
import { formatCurrency, formatNumber } from '../utils/formatters';

const INITIAL_MESSAGES: InsightChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content:
      'Welcome to the ChurnIQ Business Insights Assistant preview. Select a suggested question below or enter a retention question to inspect sample analytical summaries. (Frontend UI only — live LLM / FastAPI connection is not active yet.)',
    timestamp: 'Ready',
    isDemoResponse: true,
  },
];

export default function BusinessInsights() {
  const { data, loading, error, refetch } = useAsyncData(
    () => getBusinessInsights(),
    []
  );

  const [messages, setMessages] = useState<InsightChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: InsightChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: now,
    };

    const replyMsg: InsightChatMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      content: getDemoAssistantReply(trimmed),
      timestamp: now,
      isDemoResponse: true,
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setInputValue('');
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(inputValue);
  };

  if (loading) return <LoadingState variant="page" />;
  if (error || !data) {
    return (
      <ErrorState
        message={error || 'Unable to load business insights.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs text-[var(--text-secondary)]">
            Monthly Revenue at Risk
          </p>
          <p className="font-mono-num mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {formatCurrency(data.totalMrrAtRisk)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Across At-Risk subscriber cohort
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs text-[var(--text-secondary)]">
            High-Risk Accounts
          </p>
          <p className="font-mono-num mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {formatNumber(data.highRiskAccountsCount)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Prioritized for outreach playbooks
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs text-[var(--text-secondary)]">
            Projected Annual Savings
          </p>
          <p className="font-mono-num mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(data.projectedAnnualSavings)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Illustrative retention program impact
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs text-[var(--text-secondary)]">
            Retention Lift Potential
          </p>
          <p className="font-mono-num mt-2 text-2xl font-semibold text-[var(--accent-primary)]">
            +{data.avgRetentionLiftPotential}%
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Target contract + autopay migration
          </p>
        </div>
      </div>

      {/* Main Split: Insights Analytics (Left) + AI Business Insights Assistant (Right) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left 7 Columns: Drivers, Revenue at Risk, Opportunities */}
        <div className="space-y-5 xl:col-span-7">
          <ChartCard
            title="Key Churn Drivers"
            subtitle="Primary structural factors correlated with customer attrition in sample data"
          >
            <div className="space-y-4">
              {data.keyDrivers.map((drv) => (
                <div
                  key={drv.id}
                  className="border-b border-[var(--border-subtle)] pb-3.5 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                      {drv.driver}
                    </h4>
                    <span className="font-mono-num text-xs font-medium text-rose-600 dark:text-rose-400">
                      {drv.churnRateImpact}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {drv.summary}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent-primary)]"
                      style={{ width: `${drv.relativeImportance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Revenue at Risk by Contract Type"
            subtitle="Monthly recurring revenue exposure across contract terms"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenueAtRiskByContract}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="contract" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={RECHARTS_AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={RECHARTS_TOOLTIP_STYLE}
                    formatter={(val) => [formatCurrency(Number(val ?? 0)), 'MRR at Risk']}
                  />
                  <Bar
                    dataKey="mrrAtRisk"
                    name="MRR at Risk"
                    fill={CHART_COLORS.rose}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Retention Opportunities & Recommendations"
            subtitle="Targeted commercial actions ranked by addressable MRR"
          >
            <div className="divide-y divide-[var(--border-subtle)]">
              {data.opportunities.map((opp) => (
                <div key={opp.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                      {opp.title}
                    </h4>
                    <span className="font-mono-num text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(opp.revenueAtRisk)} MRR · ~{opp.potentialSavedAccounts} accounts
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    <strong className="font-medium text-[var(--text-primary)]">
                      {opp.targetSegment}:
                    </strong>{' '}
                    {opp.recommendedTactic}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                Strategic Recommendations
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
                {data.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </ChartCard>
        </div>

        {/* Right 5 Columns: AI Business Insights Assistant (Frontend Only) */}
        <div className="xl:col-span-5">
          <div className="flex h-[680px] flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Business Insights Assistant
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Frontend preview · Pre-configured sample responses
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMessages(INITIAL_MESSAGES)}
                title="Reset conversation"
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            </div>

            <div className="px-4 pt-3">
              <DemoNotice
                title="Preview Chat Interface"
                message="Responses are illustrative frontend placeholders. No AI/LLM API is connected yet."
              />
            </div>

            {/* Conversation History */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-[var(--text-muted)]">
                      {isUser ? 'You' : 'Insights Assistant'} · {msg.timestamp}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="border-t border-[var(--border-subtle)] px-4 py-3">
              <p className="mb-2 text-[11px] font-medium text-[var(--text-muted)]">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_INSIGHT_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuestion(q)}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-left text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleChatSubmit}
              className="flex items-center gap-2 border-t border-[var(--border-subtle)] p-3"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about churn drivers, segments, or retention..."
                aria-label="Ask business insights assistant"
                className="h-9 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Send message"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
