"use client";

import { useState } from "react";
import UploadForm from "../components/UploadForm";
import RoadmapTable from "../components/RoadmapTable";
import WeeklyQuiz from "../components/WeeklyQuiz";
import { RoadmapResponse, WeeklyPrepResponse } from "../types/api";

type AppState = "upload" | "roadmap" | "quiz";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  
  // Data State
  const [courseId, setCourseId] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  const [prepData, setPrepData] = useState<WeeklyPrepResponse | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = async (cid: string) => {
    setCourseId(cid);
    await fetchRoadmap(cid);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchRoadmap = async (cid: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/roadmap?course_id=${cid}`);
      if (!res.ok) {
        throw new Error("Failed to fetch roadmap. The backend scheduler might have encountered an error.");
      }
      const data: RoadmapResponse = await res.json();
      setRoadmapData(data);
      setAppState("roadmap");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleWeekSelect = async (week: number) => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/weekly-prep/${week}?course_id=${courseId}`);
      if (!res.ok) {
        throw new Error("Failed to generate weekly prep. The RAG pipeline might have encountered an error.");
      }
      const data: WeeklyPrepResponse = await res.json();
      setPrepData(data);
      setAppState("quiz");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
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
            <h1>Your Journey Ahead.</h1>
            <p>Here is your personalized roadmap for <strong>{roadmapData.course.code}</strong>. Select any teaching week to instantly generate a study guide and quiz based on your materials.</p>
          </div>
        )}
        {appState === "quiz" && prepData && (
          <div className="animate-enter">
            <h1>Master Week {prepData.week}.</h1>
            <p>We've extracted the key concepts for this week's topics. Review the summary and test your knowledge below.</p>
          </div>
        )}
      </div>

      {/* Action / Interaction Pane */}
      <div className="action-pane">
        {error && <div className="error-box animate-enter">{error}</div>}
        
        {loading && (
          <div className="loading-box animate-enter">
            Processing... Please wait a moment while the AI analyzes your documents.
          </div>
        )}

        {!loading && appState === "upload" && (
          <div className="animate-enter" style={{ animationDelay: "0.1s" }}>
            <UploadForm onSuccess={(cid) => handleUploadSuccess(cid)} />
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
              onBack={() => setAppState("roadmap")} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
