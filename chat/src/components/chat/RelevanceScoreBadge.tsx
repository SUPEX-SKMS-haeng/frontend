import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, Info } from 'lucide-react';
import type { ISource } from '@/types/message';

interface RelevanceScoreBadgeProps {
  source: ISource;
}

/* ── 색상 설정 ────────────────────────────────────────── */

const LEVEL_CONFIG = {
  high: {
    label: '높음',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: '보통',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-400',
    dot: 'bg-amber-400',
  },
  low: {
    label: '참고',
    bg: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-500',
    badge: 'bg-neutral-100 text-neutral-500',
    bar: 'bg-neutral-400',
    dot: 'bg-neutral-400',
  },
} as const;

type Level = keyof typeof LEVEL_CONFIG;

const getLevel = (score: number): Level => {
  if (score >= 0.75) return 'high';
  if (score >= 0.38) return 'medium';
  return 'low';
};

/* ── 세부 지표별 색상 판단 ─────────────────────────────── */

// RRF 이론적 최댓값: 양쪽 검색 모두 rank 1일 때 ≈ 0.016393
const RRF_MAX = (0.5 / 61) * 2;

/** 각 지표의 0~1 정규화 값과 등급 색상 반환 */
const getMetricColor = (
  key: 'vector' | 'rrf' | 'bm25',
  value: number,
  rank?: number
): { normalized: number; color: string; label: string } => {
  switch (key) {
    case 'vector': {
      // 코사인 유사도: 0~1 범위 그대로
      const n = Math.min(value, 1);
      if (n >= 0.85) return { normalized: n, color: 'bg-emerald-500', label: '높음' };
      if (n >= 0.7) return { normalized: n, color: 'bg-amber-400', label: '보통' };
      return { normalized: n, color: 'bg-neutral-400', label: '낮음' };
    }
    case 'rrf': {
      // RRF raw → 이론적 최댓값 대비 비율
      const n = Math.min(value / RRF_MAX, 1);
      if (n >= 0.6) return { normalized: n, color: 'bg-emerald-500', label: '높음' };
      if (n >= 0.3) return { normalized: n, color: 'bg-amber-400', label: '보통' };
      return { normalized: n, color: 'bg-neutral-400', label: '낮음' };
    }
    case 'bm25': {
      // BM25 점수는 범위가 불규칙 → 순위(rank)로 판단
      if (rank != null) {
        const n = Math.max(0, Math.min(1, 1 - (rank - 1) / 20));
        if (rank <= 3) return { normalized: n, color: 'bg-emerald-500', label: `${rank}위` };
        if (rank <= 10) return { normalized: n, color: 'bg-amber-400', label: `${rank}위` };
        return { normalized: n, color: 'bg-neutral-400', label: `${rank}위` };
      }
      // rank 없으면 점수 기반 heuristic
      const n = Math.min(value / 30, 1);
      if (value >= 10) return { normalized: n, color: 'bg-emerald-500', label: '높음' };
      if (value >= 3) return { normalized: n, color: 'bg-amber-400', label: '보통' };
      return { normalized: n, color: 'bg-neutral-400', label: '낮음' };
    }
  }
};

/* ── 지표 설명 ─────────────────────────────────────────── */

const METRIC_DESC: Record<string, string> = {
  vector: '쿼리↔문서 임베딩 간 코사인 유사도 (0~1)',
  rrf: 'BM25 + Vector 순위 퓨전 점수',
  bm25: 'TF-IDF 기반 키워드 매칭 점수',
};

/* ── 컴포넌트 ──────────────────────────────────────────── */

const RelevanceScoreBadge = ({ source }: RelevanceScoreBadgeProps) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // 종합 점수: Reranker 원점수(0~4)를 4로 나눈 값 사용, 없으면 absoluteRelevance fallback
  const rerankerRaw = source.rerankerScore;
  const compositeScore =
    rerankerRaw != null ? Math.min(rerankerRaw / 4, 1) : source.absoluteRelevance;

  if (compositeScore == null) return null;

  const level = getLevel(compositeScore);
  const c = LEVEL_CONFIG[level];
  const pct = Math.round(compositeScore * 100);

  // 세부 지표 구성
  const details = [
    {
      key: 'vector' as const,
      label: 'Vector 유사도',
      value: source.vectorScore,
      rank: source.vectorRank,
    },
    {
      key: 'rrf' as const,
      label: 'RRF Score',
      value: source.rrfScore,
    },
    {
      key: 'bm25' as const,
      label: 'BM25 Score',
      value: source.bm25Score,
      rank: source.bm25Rank,
    },
  ].filter((d) => d.value != null);

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
      {/* 메인 배지 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          <span className='text-[11px] text-neutral-400'>문서 관련도</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className={`text-[18px] font-semibold tabular-nums ${c.text}`}>
            {pct}
            <span className='text-[11px] font-normal ml-0.5'>%</span>
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
            {c.label}
          </span>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className='mt-2.5 h-1.5 bg-white/70 rounded-full overflow-hidden'>
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Reranker 원점수 표시 */}
      {rerankerRaw != null && (
        <div className='mt-1.5 text-[10px] text-neutral-400 text-right'>
          Semantic Reranker: {rerankerRaw.toFixed(2)} / 4.00
        </div>
      )}

      {/* 세부 지표 토글 */}
      {details.length > 0 && (
        <>
          <button
            onClick={() => setDetailOpen((prev) => !prev)}
            className='mt-2 flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors'
          >
            <BarChart3 className='w-3 h-3' />
            <span>세부 검색 지표 보기</span>
            {detailOpen ? <ChevronUp className='w-3 h-3' /> : <ChevronDown className='w-3 h-3' />}
          </button>

          {detailOpen && (
            <div className='mt-2 pt-2 border-t border-black/5 space-y-2.5'>
              {details.map((d) => {
                const mc = getMetricColor(d.key, d.value!, d.rank);
                return (
                  <div key={d.key}>
                    {/* 라벨 + 수치 */}
                    <div className='flex items-center justify-between mb-1'>
                      <div
                        className='flex items-center gap-1 relative'
                        onMouseEnter={() => setHoveredMetric(d.key)}
                        onMouseLeave={() => setHoveredMetric(null)}
                      >
                        <span className='text-[11px] text-neutral-400'>{d.label}</span>
                        <Info className='w-3 h-3 text-neutral-300 cursor-help' />
                        {/* 툴팁 */}
                        {hoveredMetric === d.key && (
                          <div className='absolute left-0 bottom-full mb-1 px-2 py-1 bg-neutral-800 text-white text-[10px] rounded whitespace-nowrap z-10'>
                            {METRIC_DESC[d.key]}
                          </div>
                        )}
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-[11px] font-mono text-neutral-600'>
                          {d.value!.toFixed(4)}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-px rounded font-medium ${
                            mc.color === 'bg-emerald-500'
                              ? 'bg-emerald-100 text-emerald-700'
                              : mc.color === 'bg-amber-400'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {mc.label}
                        </span>
                      </div>
                    </div>
                    {/* 색상 바 */}
                    <div className='h-1 bg-white/60 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full ${mc.color} transition-all duration-400 ease-out opacity-80`}
                        style={{ width: `${Math.round(mc.normalized * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RelevanceScoreBadge;
