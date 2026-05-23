type CountdownProps = {
  kind: "countdown";
  display: string;
  urgent: boolean;
};

type ElapsedProps = {
  kind: "elapsed";
  totalDisplay: string;
  questionDisplay: string;
};

type TimerDisplayProps = CountdownProps | ElapsedProps;

const TimerDisplay = (props: TimerDisplayProps) => {
  if (props.kind === "countdown") {
    return (
      <span
        className={`font-display text-sm font-bold tabular-nums ${
          props.urgent ? "text-red-600" : "text-secondary"
        }`}
      >
        {props.display}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0">
      <span className="font-display text-[11px] tabular-nums text-secondary leading-tight">
        {props.totalDisplay}
      </span>
      <span className="font-display text-[10px] tabular-nums text-secondary/60 leading-tight">
        שאלה {props.questionDisplay}
      </span>
    </div>
  );
};

export default TimerDisplay;
