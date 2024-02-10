import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Box,
  Card,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Switch,
  Typography,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import NextLink from "next/link";

import { type RouterOutput } from "~/server/api/root";
import { api } from "~/utils/api";
import { useEffect } from "react";

export const RulesSection = (props: {
  configuration: NonNullable<RouterOutput["configuration"]["getById"]>;
}) => {
  const { configuration } = props;

  const rules = configuration.rules;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <DndContext sensors={sensors}>
      <SortableContext items={rules.map((rule) => rule.id)}>
        {rules.map((rule) => (
          <SortableItem id={rule.id} key={rule.id}>
            <Rule rule={rule} />
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

function SortableItem(props: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}

function Rule(props: {
  rule: RouterOutput["configuration"]["getById"]["rules"][number];
}) {
  const utils = api.useContext();

  const { mutate, variables, isLoading } = api.rule.update.useMutation({
    onSettled: async () => {
      // await because we want to keep displaying the optimistic update until the refetch is done
      return await utils.configuration.invalidate();
    },
  });

  const rule = isLoading && variables ? variables : props.rule;

  return (
    <Box sx={{ p: 1 }}>
      <Card sx={{ cursor: "grab" }}>
        <Grid
          container
          sx={{
            ">*": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <Grid item xs={0.5}>
            <DragIndicatorIcon />
          </Grid>

          <Grid item xs={1.3}>
            <FormControlLabel
              control={<Switch checked={rule.enabled} />}
              label={rule.enabled ? "Enabled" : "Disabled"}
              onChange={() => {
                handleEnabledClick(!rule.enabled);
              }}
            />
          </Grid>
          <Grid item sx={{ display: "flex", flexGrow: 1, gap: 1 }}>
            <Link component={NextLink} href={`/dashboard/rule/${rule.id}`}>
              <IconButton>
                <EditIcon />
              </IconButton>
            </Link>
            <Link component={NextLink} href={`/dashboard/rule/${rule.id}`}>
              <Typography>{rule.name}</Typography>
            </Link>
          </Grid>

          <Grid item>
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );

  function handleEnabledClick(value: boolean) {
    mutate({
      id: rule.id,
      enabled: value,
      name: rule.name,
      themeId: rule.themeId,
    });
  }
}
