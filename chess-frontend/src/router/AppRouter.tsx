import { createBrowserRouter } from "react-router-dom";
import LayoutShell from "../components/layout/LayoutShell";

import Dashboard from "../pages/Dashboard";
import PlayersList from "../pages/Players/PlayersList";
import TournamentsList from "../pages/Tournaments/TournamentsList";
import TournamentDetail from "../pages/Tournaments/TournamentDetail";
import GamesList from "../pages/Games/GamesList";
import SkillLevels from "../pages/SkillLevels";
import Mentorship from "../pages/Mentorship";
import Violations from "../pages/Violations";
import Standings from "../pages/Standings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutShell />,
    children: [
      { index: true, element: <Dashboard /> },

      { path: "tournaments", element: <TournamentsList /> },
      { path: "tournaments/:id", element: <TournamentDetail /> },

      { path: "players", element: <PlayersList /> },

      { path: "games", element: <GamesList /> },

      { path: "standings", element: <Standings /> },
      { path: "skill-levels", element: <SkillLevels /> },
      { path: "mentorship", element: <Mentorship /> },
      { path: "violations", element: <Violations /> },
    ],
  },
]);
