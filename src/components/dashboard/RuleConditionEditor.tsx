import {
  type BooleanCondition,
  type Condition,
  isBooleanCondition,
  countNestedSimpleConditions,
} from "~/utils/conditions";

export default function RuleConditionEditor(props: {
  condition: Condition;
  onChange: (value: Condition) => void;
}) {
  const { condition, onChange } = props;

  if (!isBooleanCondition(condition))
    return "Corrupted condition data. Please contact the developer.";

  return (
    <ConditionEditor
      condition={condition}
      onChange={onChange}
      onRemove={null}
    />
  );
}

type EditorProps = {
  onChange: (value: Condition) => void;
} & (
  | {
      condition: Condition;
      onRemove: () => void;
    }
  | {
      condition: BooleanCondition;
      onRemove: (() => void) | null;
    }
);

const ConditionEditor = (props: EditorProps) => {
  const { condition, onChange, onRemove } = props;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isBooleanCondition(condition))
      return console.error("This should never happen");

    const newType = e.target.value as
      | "weekday"
      | "day"
      | "month"
      | "year"
      | "hour"
      | "minute"
      | "second"
      | "datetime";

    let newCondition: Condition;

    if (newType === "weekday") {
      newCondition = {
        ...condition,
        type: newType,
        operator:
          condition.operator === "eq" || condition.operator === "neq"
            ? condition.operator
            : "eq",
        value: condition.type === "datetime" ? 0 : condition.value,
      };
    } else if (newType === "datetime") {
      newCondition = {
        ...condition,
        type: newType,
        value: new Date(condition.value),
      };
    } else if (condition.type === "datetime") {
      newCondition = {
        ...condition,
        type: newType,
        value: condition.value.getTime(),
      };
    } else {
      newCondition = {
        ...condition,
        type: newType,
        value: condition.value,
      };
    }

    onChange(newCondition);
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isBooleanCondition(condition))
      return console.error("This should never happen");

    const newOperator = e.target.value as "eq" | "neq" | "gt" | "lt";

    let newCondition: Condition;

    if (
      condition.type === "weekday" &&
      (newOperator === "eq" || newOperator === "neq")
    ) {
      newCondition = {
        ...condition,
        operator: newOperator,
      };
    } else if (condition.type !== "weekday") {
      newCondition = {
        ...condition,
        operator: newOperator,
      };
    } else {
      return;
    }

    onChange(newCondition);
  };

  if (isBooleanCondition(condition)) {
    return (
      <div
        style={{
          padding: "12px",
          border: "1px solid black",
          margin: "12px",
          background: "#0000000f",
        }}
      >
        <select
          value={condition.operator}
          onChange={(e) =>
            onChange({ ...condition, operator: e.target.value as "and" | "or" })
          }
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
        <div></div>
        {condition.conditions.map((c, i) => (
          <div key={i}>
            <ConditionEditor
              condition={c}
              onChange={(newCondition) => {
                const newConditions = [...condition.conditions];
                newConditions[i] = newCondition;
                onChange({ ...condition, conditions: newConditions });
              }}
              onRemove={() => {
                const newConditions = [...condition.conditions];
                newConditions.splice(i, 1);
                onChange({ ...condition, conditions: newConditions });
              }}
            />
          </div>
        ))}
        <button
          onClick={() =>
            onChange({
              ...condition,
              conditions: [
                ...condition.conditions,
                { type: "boolean", operator: "and", conditions: [] },
              ],
            })
          }
        >
          Add new boolean condition
        </button>{" "}
        <button
          onClick={() =>
            onChange({
              ...condition,
              conditions: [
                ...condition.conditions,
                { type: "day", operator: "eq", value: 1 },
              ],
            })
          }
        >
          Add new simple condition
        </button>{" "}
        {onRemove !== null && (
          <button
            onClick={() => {
              const nestedSimpleConditions =
                countNestedSimpleConditions(condition);
              if (
                nestedSimpleConditions > 1 &&
                !confirm(
                  `This will remove all ${nestedSimpleConditions} nested simple conditions. Are you sure?`
                )
              )
                return;

              onRemove();
            }}
            title="Remove this condition"
          >
            ❌
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "12px",
        border: "1px solid black",
        margin: "12px",
        background: "#0000000f",
      }}
    >
      <select value={condition.type} onChange={handleTypeChange}>
        <option value="weekday">Weekday</option>
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="hour">Hour</option>
        <option value="minute">Minute</option>
        <option value="second">Second</option>
        <option value="datetime">Datetime</option>
      </select>{" "}
      <select value={condition.operator} onChange={handleOperatorChange}>
        <option value="eq">Equals</option>
        <option value="neq">Not equals</option>
        {condition.type !== "weekday" && (
          <>
            <option value="gt">Greater than</option>
            <option value="lt">Less than</option>
          </>
        )}
      </select>{" "}
      <input
        type="number"
        value={
          condition.type === "datetime"
            ? condition.value.getTime()
            : condition.value
        }
        onChange={(e) => {
          if (condition.type === "datetime") {
            return onChange({
              ...condition,
              value: new Date(parseInt(e.target.value)),
            });
          }
          onChange({
            ...condition,
            value: parseInt(e.target.value),
          });
        }}
      />
      {"  "}
      {onRemove === null ? (
        "this should never happen"
      ) : (
        <button onClick={() => onRemove()} title="Remove this condition">
          ❌
        </button>
      )}
    </div>
  );
};
