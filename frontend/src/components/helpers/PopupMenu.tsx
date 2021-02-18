import React, { FC } from "react";
import { Menu } from "@material-ui/core";

// expects direct passing of the children array
// e.g. <PopupMenu {...props} children={array} />
interface PopupMenuProps {
  menuID: string;
  children: JSX.Element[];
  open: boolean;
  anchor: HTMLElement | null;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

const PopupMenu: FC<PopupMenuProps> = ({
  menuID,
  open,
  anchor,
  onClose,
  children,
}) => {
  return (
    <Menu
      id={menuID}
      open={open}
      anchorEl={anchor}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      onClose={onClose}
    >
      {children}
    </Menu>
  );
};

export default PopupMenu;
