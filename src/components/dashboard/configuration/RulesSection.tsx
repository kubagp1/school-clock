import {
  Active,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { useState } from "react";
export const RulesSection = (props: {
  configuration: NonNullable<RouterOutput["configuration"]["getById"]>;
}) => {
  const utils = api.useContext();
  const { configuration } = props;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // I have no idea why this is necessary but without it the drag animation is bugged
  const setDragActive = useState<Active | null>(null)[1];

  const { mutate: mutateOrder, variables } = api.rule.updateOrder.useMutation({
    onSettled: async () => {
      // await because we want to keep displaying the optimistic update until the refetch is done
      return await utils.configuration.invalidate();
    },
  });

  const rules = configuration.rules.sort((a, b) => {
    if (variables === undefined) return a.index - b.index;

    const aOptimisticIndex = variables.find((rule) => rule.id === a.id)?.index;
    const bOptimisticIndex = variables.find((rule) => rule.id === b.id)?.index;

    if (aOptimisticIndex === undefined || bOptimisticIndex === undefined)
      return a.index - b.index;

    return aOptimisticIndex - bOptimisticIndex;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id === over?.id) {
      return;
    }

    const oldIndex = rules.findIndex((rule) => rule.id === active.id);
    const newIndex = rules.findIndex((rule) => rule.id === over?.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder: { id: string; index: number }[] = arrayMove(
      rules.map((rule) => rule.id),
      oldIndex,
      newIndex
    ).map((id, index) => ({ id, index }));

    mutateOrder(newOrder);

    setDragActive(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setDragActive(active);
      }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        strategy={verticalListSortingStrategy}
        items={rules.map((rule) => rule.id)}
      >
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
          <Grid item lg={0.5}>
            <DragIndicatorIcon />
          </Grid>

          <Grid item lg={1.3}>
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
