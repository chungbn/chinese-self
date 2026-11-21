import { HashRouter, NavLink, Route, Routes } from "react-router";
import Home from "./pages/Home";
import PinyinPage from "./pages/PinyinPage";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import LessonLearn from "./pages/LessonLearn";
import Review from "./pages/Review";
import Dictionary from "./pages/Dictionary";
import Settings from "./pages/Settings";
import { PlanTracker } from "./components/PlanTracker";

const NAV = [
  { to: "/", label: "Hôm nay", icon: "☀" },
  { to: "/pinyin", label: "Pinyin", icon: "ā" },
  { to: "/lessons", label: "Bài học", icon: "课" },
  { to: "/review", label: "Ôn tập", icon: "↻" },
  { to: "/dict", label: "Tra từ", icon: "字" },
  { to: "/settings", label: "Cài đặt", icon: "⚙" },
];

function Nav() {
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] whitespace-nowrap sm:flex-none sm:flex-row sm:gap-2 sm:text-sm ${
      isActive ? "text-brand-700 dark:text-brand-500 font-semibold" : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
    }`;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur sm:sticky sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-2 py-1 sm:px-4 sm:py-2">
        <span className="han mr-4 hidden text-xl font-bold text-brand-700 sm:inline">中文</span>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"} className={cls}>
            <span className="han text-lg leading-none" aria-hidden>
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <HashRouter>
      <PlanTracker />
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pt-4 pb-24 sm:pb-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pinyin" element={<PinyinPage />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />
          <Route path="/lessons/:id/learn" element={<LessonLearn />} />
          <Route path="/review" element={<Review />} />
          <Route path="/dict" element={<Dictionary />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
