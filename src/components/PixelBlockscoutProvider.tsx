import React from "react";
import {
  NotificationProvider,
  TransactionPopupProvider,
} from "@blockscout/app-sdk";
import { BlockscoutPixelTheme } from "../style/BlockscoutPixelTheme";

export const CustomBlockscoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="blockscout-theme">
    <NotificationProvider>
      <TransactionPopupProvider>
        <BlockscoutPixelTheme />
        {children}
      </TransactionPopupProvider>
    </NotificationProvider>
  </div>
);
