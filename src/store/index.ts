import { configureStore } from "@reduxjs/toolkit";
import { configApi } from "./configApi";

export const store = configureStore({
  reducer: { [configApi.reducerPath]: configApi.reducer },
  middleware: (getDefault) => getDefault().concat(configApi.middleware),
});
