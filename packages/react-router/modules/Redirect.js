/*
  调用history库的posh或replace 修改一下location对象.
*/
import React from "react";
import PropTypes from "prop-types";
import { createLocation, locationsAreEqual } from "history";
import invariant from "tiny-invariant";

import Lifecycle from "./Lifecycle.js";
import RouterContext from "./RouterContext.js";
import generatePath from "./generatePath.js";

/**
 * The public API for navigating programmatically with a component.
 */
function Redirect({ computedMatch, to, push = false }) {
  return (
    <RouterContext.Consumer>
      {context => {
        invariant(context, "You should not use <Redirect> outside a <Router>");

        const { history, staticContext } = context;

        const method = push ? history.push : history.replace;
        const location = createLocation(
          computedMatch
            ? typeof to === "string"
              ? generatePath(to, computedMatch.params)
              : {
                  ...to,
                  pathname: generatePath(to.pathname, computedMatch.params)
                }
            : to
        );

        // When rendering in a static context,
        // set the new location immediately.
        if (staticContext) {
          method(location);
          return null;
        }

        return (
          <Lifecycle
            onMount={() => {
              method(location);
            }}
            onUpdate={(self, prevProps) => {
              const prevLocation = createLocation(prevProps.to);
              if (
                !locationsAreEqual(prevLocation, {
                  ...location,
                  key: prevLocation.key
                })
              ) {
                method(location);
              }
            }}
            to={to}
          />
        );
      }}
    </RouterContext.Consumer>
  );
}

if (__DEV__) {
  Redirect.propTypes = {
    push: PropTypes.bool,
    from: PropTypes.string,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
  };
}

export default Redirect;
