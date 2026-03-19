import { useState } from "react";

export function useConfirmation() {
  const [isConfirming, setIsConfirming] = useState(false);
  return {
    isConfirming,
    startConfirm: () => setIsConfirming(true),
    cancelConfirm: () => setIsConfirming(false),
  };
}
