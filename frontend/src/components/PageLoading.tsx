interface PageLoadingProps {
  label?: string;
}

const PageLoading = ({ label = "טוען…" }: PageLoadingProps) => (
  <div className="mx-auto w-full max-w-[720px] p-4">
    <p className="text-stone-600">{label}</p>
  </div>
);

export default PageLoading;
