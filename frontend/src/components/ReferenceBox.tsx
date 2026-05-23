const ReferenceBox = ({ reference }: { reference: string }) => (
  <div className="rounded-2xl border border-default bg-[var(--surface-muted)] p-3">
    <p className="text-xs font-semibold text-[var(--accent)]">הפניה</p>
    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-primary">
      {reference}
    </p>
  </div>
);

export default ReferenceBox;
