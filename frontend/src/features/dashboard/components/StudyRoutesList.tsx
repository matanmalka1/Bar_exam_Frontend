import { Bookmark, CircleAlert, ClipboardList, PencilLine } from "lucide-react";
import RouteRow from "./RouteRow";

type StudyRoutesListProps = {
  mistakesHint: string;
  bookmarksHint: string;
  startingSimulation: boolean;
  onStartPractice: () => void;
  onStartSimulation: () => void;
  onOpenMistakes: () => void;
  onOpenBookmarks: () => void;
};

const StudyRoutesList = ({
  mistakesHint,
  bookmarksHint,
  startingSimulation,
  onStartPractice,
  onStartSimulation,
  onOpenMistakes,
  onOpenBookmarks,
}: StudyRoutesListProps) => (
  <section className="mt-6">
    <div className="flex items-baseline justify-between border-b border-default pb-2">
      <h2 className="font-display text-base font-bold text-[var(--accent-ink)]">
        מסלולי לימוד
      </h2>
      <span className="text-[10px] uppercase tracking-[0.22em] text-secondary">
        בחר כיוון
      </span>
    </div>

    <ul className="divide-y divide-black/10">
      <li>
        <RouteRow
          index="01"
          icon={PencilLine}
          title="תרגול חדש"
          hint="בחר חלק, מועד וכמות שאלות"
          onClick={onStartPractice}
        />
      </li>
      <li>
        <RouteRow
          index="02"
          icon={ClipboardList}
          title="סימולציה"
          hint="שאלות אקראיות מכל המאגר"
          onClick={onStartSimulation}
          disabled={startingSimulation}
          loading={startingSimulation}
        />
      </li>
      <li>
        <RouteRow
          index="03"
          icon={CircleAlert}
          title="חזרה על טעויות"
          hint={mistakesHint}
          onClick={onOpenMistakes}
        />
      </li>
      <li>
        <RouteRow
          index="04"
          icon={Bookmark}
          title="שאלות שסומנו"
          hint={bookmarksHint}
          onClick={onOpenBookmarks}
        />
      </li>
    </ul>
  </section>
);

export default StudyRoutesList;
