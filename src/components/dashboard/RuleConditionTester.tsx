import { useState } from "react";
import {
  type Circumstances,
  type Condition,
  circumstancesKeys,
  isConditionTrue,
} from "~/utils/conditions";

const defaultCircumstances: Circumstances = {
  day: 0,
  hour: 0,
  minute: 0,
  month: 0,
  second: 0,
  weekday: 0,
  year: 0,
  datetime: new Date(),
};

export default function RuleConditionTester(props: { condition: Condition }) {
  const { condition } = props;

  const [circumstances, setCircumstances] =
    useState<Circumstances>(defaultCircumstances);

  const isTrue = isConditionTrue(condition, circumstances);
  return (
    <div>
      <CircumstacesSelector
        circumstances={circumstances}
        onChange={(value) => {
          setCircumstances(value);
        }}
      />
      <br />
      <div
        style={{
          width: "min(200px, 100%)",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isTrue ? "lightgreen" : "pink",
        }}
      >
        The condition is {isTrue ? "MET" : "NOT MET"}
      </div>
    </div>
  );
}

const CircumstacesSelector = (props: {
  circumstances: Circumstances;
  onChange: (value: Circumstances) => void;
}) => {
  const { circumstances, onChange } = props;

  return (
    <div>
      <table>
        {circumstancesKeys.map((field) => (
          <tr key={field}>
            <td>{capitalizeFirstLetter(field)}</td>
            <td>
              <input
                type="number"
                value={
                  field === "datetime"
                    ? circumstances[field].getTime()
                    : circumstances[field]
                }
                onChange={(e) => {
                  onChange({
                    ...circumstances,
                    [field]: parseInt(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
