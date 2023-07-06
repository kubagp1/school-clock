import { Button, Select, TextField, Typography } from "@mui/material";
import { useRef } from "react";
import { getDashboardLayout } from "~/components/DashboardLayout";
import { api } from "~/utils/api";

function NewConfiguration() {
  const {
    data: themes,
    isError: isThemesError,
    isLoading: isThemesLoading,
  } = api.theme.getAll.useQuery();
  const nameRef = useRef<HTMLInputElement>(null);
  const themeRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading } = api.configuration.create.useMutation();

  const handleSubmit = () => {
    console.log(nameRef.current);
    console.log(themeRef.current);
    if (nameRef.current?.value && themeRef.current?.value) {
      mutate({
        name: nameRef.current.value,
        baseThemeId: themeRef.current.value,
      });
    }
  };

  return (
    <div>
      <Typography variant="h4">New Configuration</Typography>
      <TextField
        required
        type="text"
        label="Configuration name"
        inputRef={nameRef}
      ></TextField>
      <br />
      {themes != undefined && (
        <Select inputRef={themeRef} defaultValue={themes[0]?.id}>
          {themes?.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </Select>
      )}
      <br />
      <Button onClick={handleSubmit} disabled={isLoading}>
        Create new configuration
      </Button>
    </div>
  );
}

NewConfiguration.getLayout = getDashboardLayout;

export default NewConfiguration;
