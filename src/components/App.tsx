import { SWRConfig } from "swr";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import type { ColumnType } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { Topbar } from "./Topbar";
import { Board } from "./Board";
import { AddColumnModal } from "./AddColumnModal";
import { AuthModal } from "./AuthModal";

export const App = () => {
  const columns = useLayoutStore((s) => s.columns);
  const addColumn = useLayoutStore((s) => s.addColumn);
  const removeColumn = useLayoutStore((s) => s.removeColumn);
  const addColumnModal = useModal();

  const auth = useAuth();

  const handleAddColumn = (type: ColumnType, title: string, query?: string) => {
    addColumn(type, title, query);
    addColumnModal.close();
  };

  return (
    <SWRConfig value={{ onError: auth.onSWRError }}>
      <Topbar
        onAddColumn={() => addColumnModal.open()}
        onSignIn={auth.onSignIn}
        onSignOut={auth.onSignOut}
      />
      <Board
        columns={columns}
        onAddColumn={() => addColumnModal.open()}
        onRemove={(id) => removeColumn(id)}
        loading={auth.isLoading}
      />
      <AddColumnModal
        open={addColumnModal.isOpen}
        onAdd={handleAddColumn}
        onClose={() => addColumnModal.close()}
      />
      <AuthModal open={auth.modalOpen} onDemoMode={auth.onDemoMode} onClose={auth.onModalClose} />
    </SWRConfig>
  );
};
