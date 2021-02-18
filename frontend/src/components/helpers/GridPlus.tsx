import React, { FC } from "react";
import { Grid, GridProps } from "@material-ui/core";

interface GridPlusProps {
  orderBy: "column" | "row";
  crossFill?: boolean;
  fillCount: number;
  childProps?: GridProps;
  children: React.ReactNode;
  childClassName: string;
}

// removing unwanted props
const GridPlus: FC<GridProps & GridPlusProps> = ({
  children,
  item,
  container,
  crossFill,
  orderBy,
  fillCount,
  childClassName,
  childProps,
  ...props
}) => {
  const createAndFillGrids = () => {
    const arr2D = new Array<Array<JSX.Element>>(fillCount);
    for (let i = 0; i < arr2D.length; i++) arr2D[i] = [];
    const childrenArr = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return null;
      }
      return child;
    });
    if (childrenArr === undefined || childrenArr === null) return null;
    // would have rather just filtered this... but react children only has map
    const filteredChildren = childrenArr.filter((child) => child !== null);
    if (crossFill) {
      let arrIndex = 0;
      for (
        let i = 0;
        i < filteredChildren.length;
        i++, arrIndex = (arrIndex + 1) % fillCount
      ) {
        arr2D[arrIndex].push(filteredChildren[i]);
      }
    } else {
      for (let i = 0; i < filteredChildren.length; i++) {
        let n = Math.floor(i / fillCount);
        arr2D[n].push(filteredChildren[i]);
      }
    }

    const arr = new Array<JSX.Element>(fillCount);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (
        <Grid key={i} item className={childClassName}>
          <Grid {...childProps} container direction={orderBy}>
            {arr2D[i]}
          </Grid>
        </Grid>
      );
    }
    return arr;
  };

  const gridChildren = createAndFillGrids();

  return (
    <Grid {...props} container>
      {gridChildren}
    </Grid>
  );
};

export default GridPlus;
