import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

interface NavItem {
  label: string;
  description: string;
  to: string;
}

const ITEMS: NavItem[] = [
  { label: "תרגול חדש", description: "בחר חלק, מועד ומספר שאלות", to: "/practice/new" },
  { label: "בחינת מועד", description: "תרגל מועד ספציפי", to: "/practice/new?flow=exam" },
  { label: "טעויות", description: "חזור על שאלות שטעית בהן", to: "/mistakes" },
  { label: "סימניות", description: "שאלות שסימנת", to: "/bookmarks" },
];

const MorePage = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-28 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">עוד</h1>
        <p className="text-sm text-gray-600">ניווט מהיר</p>
      </header>

      <section className="grid gap-3">
        {ITEMS.map((item) => (
          <Card
            key={item.to}
            role="button"
            tabIndex={0}
            onClick={() => navigate(item.to)}
            className="cursor-pointer"
          >
            <p className="font-semibold text-gray-900">{item.label}</p>
            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
          </Card>
        ))}
      </section>

      <section className="pt-4">
        <Card>
          <p className="text-xs font-medium text-gray-500">אודות</p>
          <p className="mt-1 text-sm text-gray-700">תרגול בחינות לשכה</p>
          <p className="mt-1 text-xs text-gray-500">משתמש פיתוח · גרסת MVP</p>
        </Card>
      </section>
    </div>
  );
};

export default MorePage;
