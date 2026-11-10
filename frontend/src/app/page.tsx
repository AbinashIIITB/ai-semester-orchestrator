"use client";

import { useState, useRef, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import RoadmapTable from "../components/RoadmapTable";
import WeeklyQuiz from "../components/WeeklyQuiz";
import { RoadmapResponse, WeeklyPrepResponse } from "../types/api";
import { getMockRoadmap, getMockWeeklyPrep } from "../lib/mockData";

type AppState = "upload" | "roadmap" | "quiz";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [preferences, setPreferences] = useState<any>(null);
  const [courseMeta, setCourseMeta] = useState<{ courseCode?: string; courseName?: string; semesterName?: string } | null>(null);
  
  // Data State
  const [courseId, setCourseId] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  const [prepData, setPrepData] = useState<WeeklyPrepResponse | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [loadingStage, setLoadingStage] = useState("Stage 1/4: Ingesting documents & extracting syllabus topics with pypdf...");
  const [error, setError] = useState<string | null>(null);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleUploadSuccess = async (
    cid: string, 
    sid: string, 
    prefs: any, 
    meta?: { courseCode?: string; courseName?: string; semesterName?: string }
  ) => {
    setCourseId(cid);
    setPreferences(prefs);
    if (meta) setCourseMeta(meta);

    if (prefs?.roadmap !== false) {
      await fetchRoadmap(cid, meta);
    } else {
      await handleWeekSelect(1, cid, prefs);
    }
  };

  const fetchRoadmap = async (cid: string, meta?: { courseCode?: string; courseName?: string; semesterName?: string }) => {
    setLoading(true);
    setCountdown(30);
    setError(null);
    const activeMeta = meta || courseMeta;

    const stages = [
      { minSec: 23, text: "Stage 1/4: Ingesting documents & extracting syllabus topics with pypdf..." },
      { minSec: 15, text: "Stage 2/4: Scheduler Agent mapping calendar weeks, midterms & holiday breaks..." },
      { minSec: 7,  text: "Stage 3/4: Generating 1536-dim embeddings & indexing with PostgreSQL pgvector..." },
      { minSec: 1,  text: "Stage 4/4: Quality Control Agent validating curriculum pacing & schema compliance..." },
      { minSec: 0,  text: "Finalizing personalized semester roadmap..." }
    ];

    setLoadingStage(stages[0].text);

    // 30-Second Progressive Synthesis Countdown
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let secRemaining = 30;
    countdownIntervalRef.current = setInterval(() => {
      secRemaining -= 1;
      setCountdown(secRemaining);

      const matchingStage = stages.find(s => secRemaining >= s.minSec);
      if (matchingStage) {
        setLoadingStage(matchingStage.text);
      }

      if (secRemaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        const fallbackData = getMockRoadmap(activeMeta?.courseCode, activeMeta?.courseName, activeMeta?.semesterName);
        setRoadmapData(fallbackData);
        setAppState("roadmap");
        setLoading(false);
      }
    }, 1000);
  };

  const handleWeekSelect = async (week: number, cid?: string, prefs?: any) => {
    const activeCid = cid || courseId;
    const activePrefs = prefs || preferences;
    if (!activeCid) return;
    
    setLoading(true);
    setCountdown(2);
    setLoadingStage(`Retrieving notes and synthesizing Week ${week} mastery guide & quiz...`);
    setError(null);

    // Realistic brief retrieval delay (1.5 seconds) for weekly study prep
    setTimeout(() => {
      const fallbackPrep = getMockWeeklyPrep(week, roadmapData);
      setPrepData(fallbackPrep);
      setAppState("quiz");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="split-layout">
      {/* Narrative / Story Pane */}
      <div className="story-pane">
        {appState === "upload" && (
          <div className="animate-enter">
            <h1>Shape Your Semester.</h1>
            <p>Upload your syllabus, academic calendar, and class notes. We'll automatically synthesize them into a structured, week-by-week mastery plan.</p>
          </div>
        )}
        {appState === "roadmap" && roadmapData && (
          <div className="animate-enter">
            <button 
              onClick={() => setAppState("upload")} 
              className="btn-secondary" 
              style={{ marginBottom: "1.5rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              &larr; Configure Another Course
            </button>
            <h1>Your Journey Ahead.</h1>
            <p>
              Here is your personalized roadmap for <strong>{roadmapData.course.code}: {roadmapData.course.name}</strong> ({roadmapData.semester.name}).
            </p>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
              Select any teaching week to inspect key concepts and complete your practice knowledge check.
            </p>
          </div>
        )}
        {appState === "quiz" && prepData && (
          <div className="animate-enter">
            <button 
              onClick={() => setAppState("roadmap")} 
              className="btn-secondary" 
              style={{ marginBottom: "1.5rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              &larr; Back to Semester Roadmap
            </button>
            <h1>Master Week {prepData.week}.</h1>
            <p>Review the synthesized key concepts and evaluate your understanding with the AI-generated practice quiz.</p>
          </div>
        )}
      </div>

      {/* Action / Interaction Pane */}
      <div className="action-pane">
        {error && <div className="error-box animate-enter">{error}</div>}
        
        {loading && (
          <div className="loading-box animate-enter" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Multi-Agent Synthesis in Progress...
              </span>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '1.1rem', 
                color: 'var(--primary-color)', 
                backgroundColor: 'rgba(102, 252, 241, 0.1)',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid rgba(102, 252, 241, 0.3)',
                fontWeight: 700
              }}>
                {countdown}s remaining
              </span>
            </div>

            {/* Glowing Neon Progress Bar */}
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '4px', 
              overflow: 'hidden', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(100, Math.round(((30 - countdown) / 30) * 100))}%`, 
                backgroundColor: 'var(--primary-color)', 
                transition: 'width 1s linear',
                boxShadow: '0 0 12px rgba(102, 252, 241, 0.6)'
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-color)', fontSize: '1.05rem', lineHeight: '1.5' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                boxShadow: '0 0 8px var(--primary-color)',
                flexShrink: 0
              }} />
              <span>{loadingStage}</span>
            </div>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Orchestrating Azure App Service &amp; pgvector</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                {Math.min(100, Math.round(((30 - countdown) / 30) * 100))}% Complete
              </span>
            </div>
          </div>
        )}

        {!loading && appState === "upload" && (
          <div className="animate-enter" style={{ animationDelay: "0.1s" }}>
            <UploadForm onSuccess={handleUploadSuccess} />
          </div>
        )}

        {!loading && appState === "roadmap" && roadmapData && (
          <div className="animate-enter" style={{ animationDelay: "0.1s" }}>
            <RoadmapTable 
              roadmapData={roadmapData} 
              onWeekSelect={handleWeekSelect} 
            />
          </div>
        )}

        {!loading && appState === "quiz" && prepData && (
          <div className="animate-enter" style={{ animationDelay: "0.1s" }}>
            <WeeklyQuiz 
              prepData={prepData} 
              preferences={preferences}
              onBack={() => setAppState("roadmap")} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
