type Props = { onConfirm: () => void };

const TimeUpModal = ({ onConfirm }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
    <div className="w-full max-w-sm rounded-3xl border border-default bg-[var(--paper)] p-7 shadow-xl">
      <p className="font-display text-lg font-black text-[var(--accent-ink)]">
        הזמן נגמר
      </p>
      <p className="mt-2 text-sm leading-6 text-secondary">
        הזמן המותר לבחינה הסתיים. עוברים לתוצאות.
      </p>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-6 w-full rounded-2xl bg-[var(--accent-ink)] py-3 text-sm font-bold text-white transition active:opacity-80"
      >
        לתוצאות
      </button>
    </div>
  </div>
);

export default TimeUpModal;
