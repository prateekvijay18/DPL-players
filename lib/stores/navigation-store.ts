import { create } from "zustand";

type NavigationStore = {
  pending: boolean;
  start: () => void;
  end: () => void;
};

/**
 * Global pending flag for filter/sort/search navigations on the leaderboard.
 * Filter components flip `start()` before triggering a URL change; the
 * consumer (LeaderboardTable) flips `end()` once React commits the new URL.
 */
export const useNavigationStore = create<NavigationStore>((set) => ({
  pending: false,
  start: () => set({ pending: true }),
  end: () => set({ pending: false }),
}));
