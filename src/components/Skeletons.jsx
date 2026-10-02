// Placeholder screens shown while a page or the editor is loading. They keep the layout stable
// and use a soft shimmer, which is switched off for people who prefer reduced motion.
const Bar = ({ w = "100%", h = 14, r = 8, style }) => <span className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />;

export function EditorSkeleton() {
  return (
    <div className="editor-card sk-editor" role="status" aria-label="Loading editor">
      <div className="toolbar"><Bar w={90} h={14} /><span className="toolbar-spacer" /><Bar w={84} h={28} r={8} /></div>
      <div className="sk-lines">{[62, 40, 78, 30, 55, 46, 70].map((w, i) => <Bar key={i} w={`${w}%`} h={12} />)}</div>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="sk-lesson">
      <div className="sk-pane">
        <Bar w={150} h={22} r={999} />
        <Bar w="70%" h={34} />
        <Bar w="95%" /><Bar w="82%" />
        <Bar w="100%" h={120} r={12} style={{ marginTop: 14 }} />
        <Bar w="90%" /><Bar w="76%" /><Bar w="84%" />
      </div>
      <div className="sk-pane sk-pane-code"><EditorSkeleton /></div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dash">
      <div className="sk-col"><Bar w={180} h={12} /><Bar w="46%" h={34} /><Bar w="60%" /></div>
      <Bar w="100%" h={220} r={18} />
      <div className="stat-row">{[0, 1, 2, 3].map((i) => <Bar key={i} w="100%" h={74} r={14} />)}</div>
      <div className="dash-cols"><Bar w="100%" h={300} r={16} /><Bar w="100%" h={300} r={16} /></div>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="page page-wide">
      <div className="sk-col"><Bar w={160} h={12} /><Bar w="38%" h={34} /><Bar w="58%" /></div>
      <div className="day-grid">{[0, 1, 2, 3, 4, 5].map((i) => <Bar key={i} w="100%" h={190} r={14} />)}</div>
    </div>
  );
}

export default function PageSkeleton({ variant = "cards" }) {
  const body = variant === "lesson" ? <LessonSkeleton /> : variant === "dashboard" ? <DashboardSkeleton /> : variant === "editor" ? <div className="sk-lesson sk-solo"><EditorSkeleton /></div> : <CardsSkeleton />;
  return <div className="sk-page" role="status" aria-busy="true" aria-label="Loading page">{body}</div>;
}
