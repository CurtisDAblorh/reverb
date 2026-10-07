import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore, type RootState } from "@/store";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Renders UI with a fresh Redux store, returning the store for assertions. */
export function renderWithStore(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = makeStore(preloadedState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <TooltipProvider>{ui}</TooltipProvider>
      </Provider>,
    ),
  };
}
