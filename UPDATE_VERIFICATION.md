# PyPath v1.4.26 — Next Class button + trophy shine

- Removed the 5-second ring and the auto-advance timer from the quiz success popup.
- The popup has a **Next Class** button (**Finish** after the last class). Completion is still saved the moment the quiz is passed;
  the button re-confirms it and then opens the next class.
- A light "shine" sweeps diagonally across the trophy circle (disabled for reduced-motion users).
- Statuses unchanged: passed class = Completed, next class = Pending, later classes = Not started.
- Verified in real Chromium (desktop + phone): 25 browser checks. `npm test`: 45/45.

# PyPath v1.4.25 — Auto-advance quiz popup

- The quiz success popup has **no button**. A ring fills around the trophy over **5 seconds**, then the next class opens automatically.
- The class is saved **Completed the moment the quiz is passed** (also re-confirmed when the 5 seconds end). Leaving early never loses it.
- After a passed quiz: finished class = **Completed**, the next class = **Pending** (with Start Lesson), all other upcoming classes = **Not started**.
  The "Pending" class is stored explicitly (`pypath_pending`), so it is always the class right after the one just passed, even if saved progress has a gap.
- After the last class the popup closes by itself after 5 seconds.
- Changing an answer to the correct one after pressing Check passes and completes automatically (no second click).
- The popup and the sidebar show the running build ("PyPath v1.4.25") so an old cached build is easy to spot.
- Verified in real Chromium (desktop + phone): 25 browser checks incl. ring animation, ~5 s auto-advance, leaving early, gaps in saved progress, last class, 4/5 not completing. `npm test`: 45/45.

# PyPath v1.4.24 — Quiz popup always marks the class complete

- Passing the quiz **marks the class Completed immediately** (before any button is clicked).
- After pressing **Check answers** once, changing a wrong answer to the right one passes the quiz and completes the class
  automatically; no second Check click is needed.
- The popup button is now **Mark Complete & Next Class**: it always marks the class complete first, then opens the next class
  (the 5-second auto-advance uses the same path). When there is no next class the button is **Done**.
- A passed quiz force-completes the class, so it no longer depends on which lesson was stored as active.
- After completion: finished class = **Completed**, next class = **Pending** (Start Lesson button), the rest = Not started.
- A small "PyPath v1.4.24" tag at the bottom of the sidebar shows which build is running.
- Verified in real Chromium (desktop + phone size): wrong-then-fixed, first-try, auto-advance, mismatched saved state,
  double-click, and 4/5 not completing. `npm test`: 43/43.

# PyPath v1.4.24 — Quiz completion fix

**Bug:** after a wrong attempt, fixing the answers and passing the quiz, then pressing Next Class left the
finished class "In Progress" (Pending) instead of marking it Completed.

**Fix**
- Quiz result is now a snapshot taken when "Check answers" is pressed (no silent live flip while changing answers).
- Completion is saved directly in the Check click, and re-confirmed (idempotent) when Next Class / the 5-second timer fires.
- The 5-second auto-advance timer is no longer cancelled by re-renders.
- `completeLesson` reads saved progress fresh instead of a stale closure. The completed class stays Completed and the next class becomes the single In Progress one.
- Correct answers are highlighted green, wrong ones red, after a check.
- **Next class flow:** after a passed quiz the finished class is **Completed** and the next class is **Pending** with a
  **Start Lesson** button. It becomes **In Progress** (with Mark Complete) only after Start is pressed.
- Verified in a real Chromium browser (desktop and phone size) across Day 1-6, for both first-try passes and
  wrong-then-fixed passes: previous = Completed, next = Pending + Start, Start -> In Progress.

# PyPath v1.4.23 — Update Verification

## Requested fixes

1. **Quiz pass completes the current class before navigation**
   - Passing all 5 quiz questions now calls the lesson completion handler.
   - Completion is written to local storage immediately.
   - The completed lesson remains `Completed`; the next lesson becomes the single `In Progress` lesson.
   - Completion is idempotent, so a saved completed lesson cannot require the quiz again after a reload or interrupted navigation.

2. **Safe 5-second auto-next**
   - The success window remains visible for 5 seconds when a next class exists.
   - Clicking **Next Class** navigates immediately.
   - The completion is saved before the 5-second wait, so a page reload, temporary network/server problem, or interrupted navigation does not make the learner repeat the quiz.
   - The auto timer is cleaned up if the quiz is unmounted.

3. **Quiz topic scope**
   - Each quiz continues to use only the `quiz` data belonging to the current lesson.
   - Added a curriculum test verifying every correct quiz answer is present in that same lesson's content, preventing cross-class answer content from being introduced unnoticed.

## Verification

- `npm test -- --run`: **42/42 passed**
- Package version: **1.4.23**
