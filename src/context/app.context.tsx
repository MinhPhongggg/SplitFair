// splitapp-fe/src/context/app.context.tsx
import { createContext, useContext, useState } from "react";

export interface IUserAuth {
  token: string;
  userName: string; // Tên (name) từ app cũ
  role: string;
  email?: string;
  userId?: string | number; // Thêm ID người dùng
  avatar?: string; // Thêm avatar
}

interface AppContextType {
  theme: string;
  setTheme: (v: string) => void;
  appState: IUserAuth | null;
  setAppState: (v: IUserAuth | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const useCurrentApp = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useCurrentApp must be used within AppProvider");
  return context;
};

const AppProvider = (props: IProps) => {
  const [theme, setTheme] = useState<string>("");
  const [appState, setAppState] = useState<IUserAuth | null>(null);

  return (
    <AppContext.Provider value={{ theme, setTheme, appState, setAppState }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppProvider;