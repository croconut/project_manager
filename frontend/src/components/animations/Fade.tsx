import React, { FC } from "react";
import { Transition } from "react-transition-group";
import {
  TransitionProps,
  TransitionStatus,
} from "react-transition-group/Transition";
import CSS from "csstype";

interface FadeProps {
  start: number;
  end: number;
  style?: CSS.Properties;
}

const Fade: FC<TransitionProps & FadeProps> = ({
  children,
  start,
  end,
  style,
  ...transitionProps
}) => {
  const defaultStyle: CSS.Properties = {
    transition: `opacity ${transitionProps.timeout}ms ease-in-out`,
    opacity: start,
  };

  const transitionStyles: { [key in TransitionStatus]: CSS.Properties } = {
    entering: { opacity: end },
    entered: { opacity: end },
    exiting: { opacity: start },
    exited: { opacity: start },
    unmounted: { opacity: end },
  };

  return (
    <Transition {...transitionProps}>
      {(state: TransitionStatus) => (
        <div
          style={{
            ...style,
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
