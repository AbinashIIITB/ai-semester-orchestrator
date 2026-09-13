"use client";

import { useState } from "react";
import { WeeklyPrepResponse, QuizQuestionResponse } from "../types/api";

interface WeeklyQuizProps {
  prepData: WeeklyPrepResponse;
  preferences: any;
  onBack: () => void;
}

export default function WeeklyQuiz({ prepData, preferences, onBack }: WeeklyQuizProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex: number, optionLabel: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: optionLabel });
  };

  const calculateScore = () => {
    let score = 0;
    prepData.quiz.forEach((q, i) => {
      if (answers[i] === q.correct_answer) score++;
    });
    return score;
  };

  return (
    <div>
      <button 
        onClick={onBack} 
        className="btn-secondary" 
        style={{ marginBottom: "2rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
      >
        &larr; Back to Journey
      </button>

      {preferences?.summary !== false && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Concepts to Master
          </h2>
          <div style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--primary-color)', borderRadius: '0 12px 12px 0' }}>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-color)', margin: 0 }}>
              {prepData.summary || "Summary generation was skipped."}
            </pre>
          </div>
        </div>
      )}

      {preferences?.quiz !== false && (
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Knowledge Check</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {prepData.quiz.map((q, i) => (
            <div key={i} style={{ padding: '2rem', backgroundColor: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--primary-color)', marginRight: '0.5rem' }}>{i + 1}.</span> {q.question}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {q.options.map((opt) => {
                  const isSelected = answers[i] === opt.label;
                  return (
                    <label 
                      key={opt.label} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center",
                        padding: "1rem", 
                        backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                        borderRadius: "8px",
                        cursor: submitted ? "default" : "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        value={opt.label}
                        checked={isSelected}
                        onChange={() => handleSelect(i, opt.label)}
                        disabled={submitted}
                        style={{ display: 'none' }}
                      />
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--text-muted)'}`,
                        marginRight: '1rem',
                        backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent'
                      }}>
                        {isSelected && <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '50%' }}></span>}
                      </span>
                      <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--text-heading)' : 'var(--text-color)' }}>
                        <strong>{opt.label}.</strong> {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {submitted && (
                <div style={{ 
                  marginTop: "1.5rem", 
                  padding: "1rem 1.5rem", 
                  backgroundColor: answers[i] === q.correct_answer ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 51, 102, 0.1)', 
                  borderLeft: `4px solid ${answers[i] === q.correct_answer ? 'var(--success-color)' : 'var(--danger-color)'}`,
                  borderRadius: '0 8px 8px 0'
                }}>
                  <p style={{ margin: 0, color: answers[i] === q.correct_answer ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 700 }}>
                    {answers[i] === q.correct_answer ? "Brilliant!" : `Not quite. The correct answer was ${q.correct_answer}.`}
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!submitted ? (
            <button 
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length !== prepData.quiz.length}
              style={{ padding: '1rem 3rem' }}
            >
              Check Answers
            </button>
          ) : (
            <>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Your Score</h4>
                <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-heading)', lineHeight: 1 }}>
                  {calculateScore()}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/{prepData.quiz.length}</span>
                </div>
              </div>
              <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="btn-secondary">
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
