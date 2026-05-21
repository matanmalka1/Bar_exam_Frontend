import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import ConfirmSheet from "../components/ConfirmSheet";
import { useAuth } from "../features/auth/useAuth";

const MorePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
      <AppHeader title="עוד" />

      <section className="space-y-3">
        <Card>
          <p className="text-xs font-medium text-secondary">חשבון</p>
          {user && (
            <>
              <p className="mt-1 text-sm text-secondary">{user.full_name}</p>
              <p className="text-xs text-secondary">{user.email}</p>
            </>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setConfirmLogout(true)}
            className="mt-3"
          >
            התנתקות
          </Button>
        </Card>

        <Card>
          <p className="text-xs font-medium text-secondary">אודות</p>
          <p className="mt-1 text-sm text-secondary">תרגול בחינות לשכה</p>
          <p className="mt-1 text-xs text-secondary">גרסת MVP</p>
        </Card>
      </section>

      <ConfirmSheet
        open={confirmLogout}
        title="להתנתק מהחשבון?"
        description="תועבר למסך ההתחברות."
        confirmLabel="התנתק"
        cancelLabel="ביטול"
        onConfirm={() => { setConfirmLogout(false); void onLogout(); }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default MorePage;
