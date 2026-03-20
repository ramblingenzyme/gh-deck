import { lazy, Suspense } from "preact/compat";
import { useModal } from "@/hooks/useModal";
import type { ColumnType } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { isDemoMode } from "@/env";
import { Topbar } from "./Topbar";
import { Board } from "./Board";

const AddColumnModal = lazy(() =>
  import("./AddColumnModal").then((m) => ({ default: m.AddColumnModal })),
);
const AuthModal = lazy(() => import("./AuthModal").then((m) => ({ default: m.AuthModal })));

export const App = () => {
  const columns = useLayoutStore((s) => s.columns);
  const addColumn = useLayoutStore((s) => s.addColumn);
  const removeColumn = useLayoutStore((s) => s.removeColumn);
  const addColumnModal = useModal();

  const authStatus = useAuthStore((s) => s.status);
  const logOut = useAuthStore((s) => s.logOut);
  const authModal = useModal(!isDemoMode && authStatus === "idle");

  const handleAddColumn = (type: ColumnType, title: string, query?: string) => {
    addColumn(type, title, query);
    addColumnModal.close();
  };

  const handleSignOut = () => {
    logOut();
    authModal.open();
  };

  return (
    <>
      <Topbar
        onAddColumn={() => addColumnModal.open()}
        onSignIn={() => authModal.open()}
        onSignOut={handleSignOut}
      />
      <Board
        columns={columns}
        onAddColumn={() => addColumnModal.open()}
        onRemove={(id) => removeColumn(id)}
      />
      <Suspense fallback={null}>
        <AddColumnModal
          open={addColumnModal.isOpen}
          onAdd={handleAddColumn}
          onClose={() => addColumnModal.close()}
        />
      </Suspense>
      <Suspense fallback={null}>
        <AuthModal
          open={authModal.isOpen && authStatus !== "authed"}
          onDemoMode={() => authModal.close()}
          onClose={() => authModal.close()}
        />
      </Suspense>
    </>
  );
};
