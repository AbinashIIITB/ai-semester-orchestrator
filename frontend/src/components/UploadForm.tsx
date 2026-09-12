"use client";

import { useState } from "react";
import { UploadResponse } from "../types/api";

interface UploadFormProps {
  onSuccess: (courseId: string, semesterId: string) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [courseCode, setCourseCode] = useState("CS301");
  const [courseName, setCourseName] = useState("Operating Systems");
  const [semesterName, setSemesterName] = useState("Fall 2026");
  
  const [calendarFile, setCalendarFile] = useState<File | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [notesFiles, setNotesFiles] = useState<File[]>([]);
  
  const [prefRoadmap, setPrefRoadmap] = useState(true);
  const [prefStudyGuide, setPrefStudyGuide] = useState(true);
  const [prefSummary, setPrefSummary] = useState(true);
  const [prefQuiz, setPrefQuiz] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("course_code", courseCode);
    formData.append("course_name", courseName);
    formData.append("semester_name", semesterName);

    const files: File[] = [];
    const types: string[] = [];

    if (calendarFile) {
      files.push(calendarFile);
      types.push("calendar");
    }
    if (syllabusFile) {
      files.push(syllabusFile);
      types.push("syllabus");
    }
    notesFiles.forEach(f => {
      files.push(f);
      types.push("notes");
    });

    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      setLoading(false);
      return;
    }

    files.forEach(f => formData.append("files", f));
    formData.append("file_types", JSON.stringify(types));

    const preferences = {
      roadmap: prefRoadmap,
      study_guide: prefStudyGuide,
      summary: prefSummary,
      quiz: prefQuiz
    };
    formData.append("preferences", JSON.stringify(preferences));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data: UploadResponse = await res.json();
      onSuccess(data.course_id, data.semester_id);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: 'none', padding: 0, backgroundColor: 'transparent' }}>
      
      {error && <div className="error-box">{error}</div>}
      
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Course Code</label>
          <input 
            type="text" 
            placeholder="e.g. CS301"
            value={courseCode} 
            onChange={e => setCourseCode(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Course Name</label>
          <input 
            type="text" 
            placeholder="e.g. Operating Systems"
            value={courseName} 
            onChange={e => setCourseName(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Semester</label>
          <input 
            type="text" 
            placeholder="e.g. Fall 2026"
            value={semesterName} 
            onChange={e => setSemesterName(e.target.value)} 
            required 
          />
        </div>
      </div>

      <div style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Upload Materials</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Academic Calendar (PDF)</span>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={e => setCalendarFile(e.target.files?.[0] || null)} 
                style={{ width: 'auto', border: 'none', padding: 0, backgroundColor: 'transparent' }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Syllabus (PDF)</span>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={e => setSyllabusFile(e.target.files?.[0] || null)} 
                style={{ width: 'auto', border: 'none', padding: 0, backgroundColor: 'transparent' }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Class Notes (PDFs)</span>
              <input 
                type="file" 
                multiple
                accept="application/pdf"
                onChange={e => setNotesFiles(Array.from(e.target.files || []))} 
                style={{ width: 'auto', border: 'none', padding: 0, backgroundColor: 'transparent' }}
              />
            </label>
            {notesFiles.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {notesFiles.length} file{notesFiles.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Generation Preferences</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={prefRoadmap} onChange={e => setPrefRoadmap(e.target.checked)} />
            <span>Semester Roadmap</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={prefStudyGuide} onChange={e => setPrefStudyGuide(e.target.checked)} />
            <span>Study Guide</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={prefSummary} onChange={e => setPrefSummary(e.target.checked)} />
            <span>Summary Notes</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={prefQuiz} onChange={e => setPrefQuiz(e.target.checked)} />
            <span>Weekly Quiz</span>
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} style={{ width: '100%', fontSize: '1.25rem', padding: '1.25rem' }}>
        {loading ? "Synthesizing..." : "Generate Materials"}
      </button>
    </form>
  );
}
