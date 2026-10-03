// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useApp } from "../context/AppContext";
import { navigate } from "../router";

export default function Missing({ what = "lesson" }) {
  const { lastLesson, getLesson } = useApp();
  const target = getLesson(lastLesson)?.id || "l01";
  return (
    <div className="page">
      <div className="card" role="alert">
        <h2>That {what} could not be found</h2>
        <p className="muted">The link may be old or mistyped. Your progress is safe.</p>
        <button className="btn btn-primary" onClick={() => navigate(`/lessons/${target}`)}>Go to a valid day</button>
      </div>
    </div>
  );
}
