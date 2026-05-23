import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[720px] items-center p-4">
      <Card className="w-full text-center space-y-4">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">404</p>
          <h1 className="font-display mt-1 text-3xl font-bold text-[var(--accent-ink)]">
            העמוד לא נמצא
          </h1>
          <p className="mt-2 text-sm text-secondary">
            הקישור שביקשת אינו קיים או שהועבר למקום אחר.
          </p>
        </div>
        <Button onClick={() => navigate("/")}>חזרה לבית</Button>
      </Card>
    </div>
  );
};

export default NotFoundPage;
