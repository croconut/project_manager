import React, { FC } from "react";
import { Transition } from "react-transition-group";
import {
  TransitionProps,
  TransitionStatus,
} from "react-transition-group/Transition";
import CSS from "csstype";

// should be a 0-100 value for both
interface ExpandProps {
  start: number;
  end: number;
}

const Fade: FC<TransitionProps & ExpandProps> = ({
  children,
  start,
  end,
  ...transitionProps
}) => {
  const defaultStyle: CSS.Properties = {
    transition: `transform ${transitionProps.timeout}ms ease-in-out`,
    transform: `scale(${start}, ${start})`,
  };

  const transitionStyles: { [key in TransitionStatus]: CSS.Properties } = {
    entering: {
      transform: `scale(${end}, ${end})`,
    },
    entered: {
      transform: `scale(${end}, ${end})`,
    },
    exiting: {
      transform: `scale(${start}, ${start})`,
    },
    exited: {
      transform: `scale(${start}, ${start})`,
    },
    unmounted: {
      transform: `scale(${end}, ${end})`,
    },
  };

  return (
    <Transition {...transitionProps}>
      {(state: TransitionStatus) => (
        <div
          style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
};

export default Fade;
