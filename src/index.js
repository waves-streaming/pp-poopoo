import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./routes/home";
import { Root } from "./routes/root";

import { MantineProvider } from "@mantine/core";

import { DeSoIdentityProvider } from "react-deso-protocol";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [{ path: "/", element: <Home /> }],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        colorScheme: "dark",
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <DeSoIdentityProvider>
        <RouterProvider router={router} />
      </DeSoIdentityProvider>
    </MantineProvider>
  </React.StrictMode>
);
