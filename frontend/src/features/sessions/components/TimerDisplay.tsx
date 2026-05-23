type CountdownProps = {
  kind: "countdown";
  display: string;
  urgent: boolean;
  questionDisplay: string;
  questionUrgent: boolean;
};

type ElapsedProps = {
  kind: "elapsed";
  totalDisplay: string;
  questionDisplay: string;
  questionUrgent: boolean;
};

type TimerDisplayProps = CountdownProps | ElapsedProps;

const timerText = (urgent: boolean) =>
  urgent ? "text-red-600" : "text-primary";

const TimerDisplay = (props: TimerDisplayProps) => {
  if (props.kind === "countdown") {
    return (
      <div className="flex items-end gap-3 text-right">
        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] font-semibold text-secondary">
            זמן מבחן
          </span>
          <span
            className={`font-display text-xl font-black tabular-nums ${timerText(
              props.urgent,
            )}`}
          >
            {props.display}
          </span>
        </div>
        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] font-semibold text-secondary">
            זמן שאלה
          </span>
          <span
            className={`font-display text-lg font-black tabular-nums ${timerText(
              props.questionUrgent,
            )}`}
          >
            {props.questionDisplay}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 text-right">
      <div className="flex flex-col items-end leading-none">
        <span className="text-[10px] font-semibold text-secondary">
          זמן תרגול
        </span>
        <span className="font-display text-xl font-black tabular-nums text-primary">
          {props.totalDisplay}
        </span>
      </div>
      <div className="flex flex-col items-end leading-none">
        <span className="text-[10px] font-semibold text-secondary">
          זמן שאלה
        </span>
        <span
          className={`font-display text-lg font-black tabular-nums ${timerText(
            props.questionUrgent,
          )}`}
        >
          {props.questionDisplay}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;
