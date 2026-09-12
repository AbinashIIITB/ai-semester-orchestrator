"use client";

import { RoadmapResponse } from "../types/api";

interface RoadmapTableProps {
  roadmapData: RoadmapResponse;
  onWeekSelect: (week: number) => void;
}

export default function RoadmapTable({ roadmapData, onWeekSelect }: RoadmapTableProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {roadmapData.roadmap.map((week) => {
        const isHoliday = week.is_holiday;
        const isMidterm = week.is_midterm;
        
        let bgColor = "var(--bg-alt)";
        let borderColor = "var(--border-color)";
        if (isHoliday) {
          bgColor = "transparent";
          borderColor = "var(--border-color)";
        } else if (isMidterm) {
          borderColor = "var(--secondary-color)";
        }

        return (
          <div 
            key={week.week} 
            style={{ 
              display: 'flex', 
              gap: '2rem', 
              padding: '1.5rem', 
              backgroundColor: bgColor, 
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              opacity: isHoliday ? 0.6 : 1,
              alignItems: 'center'
            }}
          >
            <div style={{ flex: '0 0 80px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Week</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: isMidterm ? 'var(--secondary-color)' : 'var(--text-heading)', lineHeight: 1 }}>{week.week}</div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {week.start_date} - {week.end_date}
              </div>
              
              {isHoliday ? (
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Holiday / Break</div>
              ) : isMidterm ? (
                <div style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>Midterm Assessment Week</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-color)' }}>
                  {week.topics.length > 0 ? (
                    week.topics.map((t, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{t}</li>)
                  ) : (
                    <li style={{ color: 'var(--text-muted)' }}>No topics scheduled</li>
                  )}
                </ul>
              )}
            </div>
            
            <div style={{ flex: '0 0 auto' }}>
              {!isHoliday && !isMidterm && week.topics.length > 0 && (
                <button onClick={() => onWeekSelect(week.week)} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                  Study Prep &rarr;
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
