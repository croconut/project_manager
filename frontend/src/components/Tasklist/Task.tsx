import React, { FC, useEffect, useState } from "react";
import {
  makeStyles,
  Card,
  Grid,
  Typography,
  IconButton,
  MenuItem,
} from "@material-ui/core";
import { ITask } from "src/staticData/types";
import { Draggable } from "react-beautiful-dnd";
import { v4 as genid } from "uuid";
import { DeleteOutlineRounded, Edit } from "@material-ui/icons";
import PopupMenu from "../helpers/PopupMenu";
import ModifyTask from "./ModifyTask";

interface TaskProps {
  task: ITask;
  index: number;
  columnId: number;
  onDelete: (task: ITask) => void;
  onUpdate: (task: ITask) => void;
}

const taskStyles = makeStyles((theme) => ({
  grow: {
    width: "100%",
    backgroundColor: "#666",
    marginTop: "5px",
    marginBottom: "5px",
  },
  growToDo: {
    width: "100%",
    backgroundColor: theme.palette.primary.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  growOngoing: {
    width: "100%",
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.success.dark})`,
    marginTop: "5px",
    marginBottom: "5px",
  },
  growComplete: {
    width: "100%",
    backgroundColor: theme.palette.success.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  growCancelled: {
    width: "100%",
    backgroundColor: theme.palette.error.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  dragging: {
    width: "100%",
    // of note, need to reduce margin by size of border
    // so margin was reduced by 2 all the way around
    margin: "3px -2px 3px -2px",
    backgroundColor: theme.palette.primary.main,
    border: `2px solid #ddd`,
  },
  taskButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    textTransform: "none",
  },
  text: {
    padding: "8px",
  },
  menuText: {
    flexGrow: 1,
    marginLeft: "25px",
  },
}));

type styletype = ReturnType<typeof taskStyles>;
type MenuTuple = [
  string,
  (event: React.MouseEvent<HTMLElement>) => void,
  JSX.Element
];

const getClass = (columnId: number, classes: styletype) => {
  switch (columnId) {
    case 0:
      return classes.growToDo;
    case 1:
      return classes.growOngoing;
    case 2:
      return classes.growComplete;
    case 3:
      return classes.growCancelled;
    default:
      return classes.grow;
  }
};

const Task: FC<TaskProps> = ({ task, index, columnId, onDelete, onUpdate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItems, setMenuItems] = useState<Array<JSX.Element>>([]);
  const [fullTaskView, setFullTaskView] = useState(false);
  const [modifyMode, setModifyMode] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const classes = taskStyles();
  const normalClass = getClass(columnId, classes);
  const description =
    task.description !== "" ? task.description : "no description";

  const menuOffClick = () => setAnchorEl(null);

  const menuOpenHandler = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  const taskClicked = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl === null) setFullTaskView(!fullTaskView);
  };

  const modifyComplete = (task: ITask) => {
    setModifyMode(false);
    onUpdate(task);
  };

  // wonder if this helps performance
  useEffect(() => {
    const runDelete = (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setAnchorEl(null);
      onDelete(task);
    };

    const runModify = (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setAnchorEl(null);
      // onUpdate(task);
      setModifyMode(true);
    };

    const createMenuItems = () => {
      const menuItemInfos: Array<MenuTuple> = [
        ["Modify", runModify, <Edit />],
        ["Delete", runDelete, <DeleteOutlineRounded />],
      ];
      const arr = new Array<JSX.Element>(menuItemInfos.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (
          <MenuItem color="inherit" onClick={menuItemInfos[i][1]} key={genid()}>
            {menuItemInfos[i][2]}
            <Typography className={classes.menuText}>
              {menuItemInfos[i][0]}
            </Typography>
          </MenuItem>
        );
      }
      setMenuItems(arr);
    };
    createMenuItems();
  }, [onDelete, onUpdate, task, classes.menuText, setAnchorEl]);

  return (
    <div style={{width: "100%"}}>
      {modifyMode && (<ModifyTask task={task} className={normalClass} onComplete={modifyComplete} />)}
      {!modifyMode && (<Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <Card
            className={snapshot.isDragging ? classes.dragging : normalClass}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            innerRef={provided.innerRef}
            onClick={taskClicked}
          >
            <Grid item>
              <Grid
                container
                direction="row"
                justify="space-between"
                wrap="nowrap"
                alignItems="flex-start"
              >
                <Typography className={classes.text}>{task.name}</Typography>
                <IconButton onClick={menuOpenHandler}>
                  <Edit />
                </IconButton>
              </Grid>
              {fullTaskView && (
                <Grid item>
                  <Typography className={classes.text}>
                    <i>{description}</i>
                  </Typography>
                </Grid>
              )}
            </Grid>

            <PopupMenu
              menuID={"task-menu-" + task._id}
              children={menuItems}
              open={menuOpen}
              anchor={anchorEl}
              onClose={menuOffClick}
            />
          </Card>
        )}
      </Draggable>)}
    </div>
  );
};

export default Task;
