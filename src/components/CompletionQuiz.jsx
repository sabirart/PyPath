// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, X } from "lucide-react";

export default function CompletionQuiz({ lesson, nextLesson, onPass, onNext, onClose }) {
  const questions = Array.isArray(lesson.quiz) ? lesson.quiz.slice(0, 5) : [];
  const total = questions.length;
  const [answers, setAnswers] = useState(() => Array(total).fill(null));
  const [attempted, setAttempted] = useState(false);
  const isCorrect = (list) => total > 0 && list.every((a, i) => a === questions[i]?.answer);
  const score = answers.reduce((n, a, i) => n + (a === questions[i]?.answer ? 1 : 0), 0);
  const allAnswered = answers.every((a) => a !== null);
  // Live result: once the person has pressed Check at least once, changing an answer to the
  // correct one passes the quiz immediately, with no second click needed.
  const passed = attempted && isCorrect(answers);

  // Always call the newest callbacks, even from timers.
  const onPassRef = useRef(onPass);
  const onNextRef = useRef(onNext);
  useEffect(() => { onPassRef.current = onPass; onNextRef.current = onNext; });
  const completionSaved = useRef(false);

  // Marks the class complete. Idempotent and called directly from the click/answer handlers
  // (not from an effect), so completion is saved at the moment the quiz is passed.
  const markComplete = () => {
    if (completionSaved.current) return;
    completionSaved.current = true;
    onPassRef.current?.();
  };
  // The Next Class button: confirms completion again (idempotent), then continues.
  const finish = () => {
    markComplete();
    onNextRef.current?.();
  };

  const choose = (qi, oi) => {
    const next = [...answers];
    next[qi] = oi;
    setAnswers(next);
    if (attempted && isCorrect(next)) markComplete();
  };
  const submit = () => {
    if (!allAnswered) return;
    setAttempted(true);
    if (isCorrect(answers)) markComplete();
  };
  const retry = () => {
    setAnswers(Array(total).fill(null));
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
            <p className="quiz-success-score"><strong>{total}/{total} correct</strong></p>
            <p className="quiz-saved"><CheckCircle2 size={16} /> This class is marked complete.</p>
            {nextLesson ? (
              <>
                <div className="quiz-next-step">
                  <CheckCircle2 size={18} />
                  <div>
                    <span>Next class</span>
                    <strong>{nextLesson.title || nextLesson.name || `Class ${nextLesson.day + 1}`}</strong>
                  </div>
                </div>
                <button className="btn btn-primary quiz-next-button" onClick={finish}>
                  Next Class <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <button className="btn btn-primary quiz-next-button" onClick={finish}>
                <CheckCircle2 size={16} /> Finish
              </button>
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
                  <legend><span>{qi + 1}</span><div className="quiz-question-copy"><div>{q.question}</div>{q.code && <pre className="quiz-code"><code>{q.code}</code></pre>}</div></legend>
                  <div className="quiz-options">
                    {q.options.map((option, oi) => (
                      <label className={`quiz-option ${answers[qi] === oi ? "is-selected" : ""} ${attempted && answers[qi] === oi && oi !== q.answer ? "is-wrong" : ""} ${attempted && answers[qi] === oi && oi === q.answer ? "is-right" : ""}`} key={oi}>
                        <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => choose(qi, oi)} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {attempted && answers[qi] !== q.answer && q.explanation && (
                    <div className="quiz-answer-explanation"><strong>Review:</strong> {q.explanation}</div>
                  )}
                </fieldset>
              ))}
              {attempted && !passed && (
                <div className="quiz-feedback quiz-fail" role="alert">
                  <strong>{score}/{total} correct.</strong> You need all 5 correct before this lesson can be completed. Review the explanations above, then try again.
                </div>
              )}
            </div>
            <footer className="quiz-footer">
              {attempted && !passed && <button className="btn btn-ghost btn-sm" onClick={retry}><RotateCcw size={15} /> Try again</button>}
              <span className="quiz-score">{attempted ? `${score}/${total} correct` : `0/${total} correct`}</span>
              <button className="btn btn-primary btn-sm" disabled={!allAnswered} onClick={submit}>Check answers</button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
