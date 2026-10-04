// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, X } from "lucide-react";

export default function CompletionQuiz({ lesson, nextLesson, onPass, onNext, onClose }) {
  const questions = Array.isArray(lesson.quiz) ? lesson.quiz.slice(0, 5) : [];
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [attempted, setAttempted] = useState(false);
  const score = useMemo(() => answers.reduce((n, a, i) => n + (a === questions[i]?.answer ? 1 : 0), 0), [answers, questions]);
  const allAnswered = answers.every((a) => a !== null);
  const passed = attempted && score === 5 && allAnswered;

  const submit = () => setAttempted(true);
  const retry = () => {
    setAnswers(Array(questions.length).fill(null));
    setAttempted(false);
  };

  return (
    <div className="quiz-backdrop" role="presentation">
      <section className={`quiz-modal ${passed ? "quiz-modal-success" : ""}`} role="dialog" aria-modal="true" aria-labelledby="completion-quiz-title">
        {passed ? (
          <div className="quiz-success-screen" role="status" aria-live="polite">
            <div className="quiz-trophy"><Trophy size={34} strokeWidth={2.2} /></div>
            <p className="eyebrow quiz-success-eyebrow">Lesson complete</p>
            <h2 id="completion-quiz-title">Great job!</h2>
            <p className="quiz-success-score"><strong>5/5 correct</strong></p>
            <p className="muted">You understood this lesson. Moving to the next class…</p>
            {nextLesson && (
              <>
                <div className="quiz-next-step">
                  <CheckCircle2 size={18} />
                  <div>
                    <span>Next class</span>
                    <strong>{nextLesson.title || nextLesson.name || `Class ${nextLesson.day + 1}`}</strong>
                  </div>
                </div>
                <button className="btn btn-primary quiz-next-button" onClick={onNext}>
                  Next Class <ArrowRight size={16} />
                </button>
              </>
            )}

          </div>
        ) : (
          <>
            <header className="quiz-head">
              <div>
                <p className="eyebrow">Lesson checkpoint</p>
                <h2 id="completion-quiz-title">Check your understanding</h2>
                <p className="muted">Answer all 5 questions correctly to complete this lesson.</p>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Close quiz"><X size={18} /></button>
            </header>
            <div className="quiz-body">
              {questions.map((q, qi) => (
                <fieldset className="quiz-question" key={qi}>
                  <legend><span>{qi + 1}</span>{q.question}</legend>
                  <div className="quiz-options">
                    {q.options.map((option, oi) => (
                      <label className={`quiz-option ${answers[qi] === oi ? "is-selected" : ""} ${attempted && answers[qi] === oi && answers[qi] !== q.answer ? "is-wrong" : ""}`} key={oi}>
                        <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              {attempted && !passed && (
                <div className="quiz-feedback quiz-fail" role="alert">
                  <strong>{score}/5 correct.</strong> You need all 5 correct before this lesson can be completed. Review the lesson and try again.
                </div>
              )}
            </div>
            <footer className="quiz-footer">
              {attempted && !passed && <button className="btn btn-ghost btn-sm" onClick={retry}><RotateCcw size={15} /> Try again</button>}
              <span className="quiz-score">{attempted ? `${score}/5 correct` : "0/5 correct"}</span>
              <button className="btn btn-primary btn-sm" disabled={!allAnswered} onClick={submit}>Check answers</button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
