import { MenuItem, Select } from "@mui/material";
import { forwardRef } from "react";
import { api } from "~/utils/api";

type Props = React.ComponentProps<typeof Select>;

export default forwardRef(function SelectTheme(props: Props, ref) {
  const { data, isLoading, isError } = api.theme.getAll.useQuery();

  const notReadyProps = { ...props, inputRef: undefined };

  if (isLoading) {
    return (
      <Select value="foo" key="loading" disabled {...notReadyProps}>
        {/* 'key' tells React to not reuse this Select */}
        <MenuItem value="foo">Loading...</MenuItem>
      </Select>
    );
  }

  if (isError) {
    return (
      <Select value="foo" key="error" disabled {...notReadyProps}>
        <MenuItem value="foo">Unable to load themes</MenuItem>
      </Select>
    );
  }

  return (
    <Select ref={ref} {...props}>
      {data.map((theme) => (
        <MenuItem key={theme.id} value={theme.id}>
          {theme.name}
        </MenuItem>
      ))}
    </Select>
  );
});
