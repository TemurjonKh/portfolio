/**
 * Canonical portfolio copy. Used by `npm run db:seed` for fresh databases and by
 * `npm run content:update` to bring an existing database up to date (matched by title).
 */
const json = (values: string[]) => JSON.stringify(values);

export const profileCopy = {
  tagline: "I build systems that sense, decide, and act. Next, I want to take that into game AI.",
  aboutText: "I study Integrated Systems Engineering at Inha University as a Samsung Global Hope Scholar. My projects cover reinforcement learning agents, computer vision on small devices, biomedical signal processing, and databases. What connects them is building the whole pipeline, from input to decision to output. I plan to continue in graduate school at KAIST or SNU, focusing on AI for games.",
  kaggleUrl: "https://www.kaggle.com/temurjonkholmirzaev",
};

/** Bundled defaults, used only when the profile has no photo or Instagram link yet. */
export const defaultPhotoUrl = "/media/profile.jpg";
export const defaultInstagramUrl = "https://www.instagram.com/xolmirzayev_temurjon/";

export const quickFactUpdates = [
  { fromLabel: "Research field", label: "Heading toward", value: "Game AI research" },
];

export const skillGroups = [
  { label: "Machine learning", items: ["Python", "PyTorch", "Reinforcement learning (Q-learning, DQN, AlphaZero)", "MediaPipe"] },
  { label: "Games", items: ["Unity", "WebGL builds"] },
  { label: "Signals & hardware", items: ["MATLAB", "Signal processing", "Control systems", "Raspberry Pi", "Arduino"] },
  { label: "Web & data", items: ["MySQL", "PHP", "Bootstrap", "HTML", "Next.js", "Git"] },
];

type ProjectCopy = {
  title: string;
  matchTitles?: string[];
  role?: string | null;
  dateLabel?: string | null;
  status?: string | null;
  track: "games" | "ai" | "sensing" | "systems";
  visibility: "public" | "teaser";
  teaser?: string | null;
  stackTags: string[];
  description: string[];
  metrics: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  images?: string[];
  order: number;
};

export const projects: ProjectCopy[] = [
  {
    title: "Maple: sponsorship marketplace",
    role: "Hackathon team project",
    status: "2nd place",
    track: "systems",
    visibility: "public",
    teaser: "A marketplace where event organizers post events, sponsors post what they back, and each side sends proposals. Won 2nd place.",
    stackTags: ["Expo (React Native)", "Supabase"],
    description: [
      "Organizers post an event once, sponsors post what they want to back, and either side sends a proposal. Deals close with public reviews.",
      "Verified organization accounts, reviews only from completed deals, and reporting and blocking for safety.",
    ],
    metrics: [],
    githubUrl: "https://github.com/0C2L2/maple",
    demoUrl: "https://mapleapp.tech",
    images: ["/media/maple-1.jpg"],
    order: 0,
  },
  {
    title: "Three RL agents on Tic-Tac-Toe",
    matchTitles: ["Reinforcement learning on Tic-Tac-Toe: three agents compared", "Reinforcement Learning Comparative Study — Tic-Tac-Toe"],
    role: "Personal project",
    track: "ai",
    visibility: "public",
    teaser: "Q-learning, DQN, and AlphaZero built from scratch and compared on the same game.",
    stackTags: ["Python", "PyTorch"],
    description: [
      "Implemented tabular Q-learning, DQN (replay buffer, target network), and AlphaZero (policy/value network with MCTS self-play) from scratch.",
      "On a game with 5,478 states, Q-learning trained in about 2 minutes and beat DQN, which needed reward shaping to learn blocking.",
      "AlphaZero learned from self-play alone, without any reward engineering.",
    ],
    metrics: ["AlphaZero win rate | 99%", "Q-learning win rate | 98%", "DQN win rate | 71%"],
    githubUrl: "https://github.com/TemurjonKh/rl-tictactoe",
    order: 1,
  },
  {
    title: "Uninvited",
    status: "In development",
    track: "games",
    visibility: "teaser",
    teaser: "A first-person strategy game for the browser, built in Unity. Its core is an AI opponent whose behavior players learn to read.",
    stackTags: [],
    description: [],
    metrics: [],
    images: ["/media/uninvited-cover.webp"],
    order: 2,
  },
  {
    title: "Smart hospital patient monitor",
    matchTitles: ["Smart hospital patient monitoring system"],
    role: "Solo project, coursework",
    track: "sensing",
    visibility: "public",
    teaser: "Turns simulated heart, breathing, and pulse signals into alerts and live dashboards.",
    stackTags: ["MATLAB", "App Designer"],
    description: [
      "Simulated a hospital monitor that turns ECG, respiration, and PPG signals into alerts and live dashboards, using base MATLAB with no toolboxes.",
      "Flagged abnormal heart rhythm from the dominant frequency of the FFT, and removed 60 Hz interference and baseline wander with a two-stage zero-phase filter.",
      "Designed a PI controller for an IV infusion pump and checked its stability through pole locations, gain and phase margins, and the step response.",
      "Wrote all seven modules and the App Designer interface myself.",
    ],
    metrics: ["MATLAB files | 22", "60 Hz attenuation | ~35 dB"],
    githubUrl: "https://github.com/TemurjonKh/Smart-hospital-monitoring-system",
    order: 3,
  },
  {
    title: "GymEye pose-tracking camera",
    matchTitles: ["GymEye: pose-estimation fitness assistant", "GymEye — Pose-Estimation Fitness Assistant"],
    role: "Personal project",
    track: "sensing",
    visibility: "public",
    teaser: "A pan-tilt camera that follows you and tracks your pose while you exercise.",
    stackTags: ["Raspberry Pi 4", "MediaPipe", "Arduino"],
    description: [
      "Built a pan-tilt camera rig (Raspberry Pi 4 with an Arduino-driven servo mount) that follows a person for real-time pose tracking.",
      "Split the work between devices: the Pi captures video and the browser runs pose estimation, keeping feedback responsive.",
    ],
    metrics: [],
    githubUrl: "https://github.com/0C2L2/GymEye",
    images: ["/media/gymeye-1.jpg", "/media/gymeye-2.jpg"],
    order: 4,
  },
  {
    title: "Assistive navigation wearable",
    matchTitles: ["Spatial Audio Navigation Assistant"],
    status: "In development",
    track: "sensing",
    visibility: "teaser",
    teaser: "A wearable that helps blind and low-vision people move through unfamiliar places, using sound instead of sight.",
    stackTags: [],
    description: [],
    metrics: [],
    order: 5,
  },
  {
    title: "Airport management system",
    matchTitles: ["Database-Integrated Airport Management System"],
    role: "Team lead and database designer, Database Systems course",
    dateLabel: "Mar–Jun 2026",
    track: "systems",
    visibility: "public",
    teaser: "A MySQL database and PHP app for managing an airport's flights, bookings, and staff.",
    stackTags: ["MySQL", "PHP", "Bootstrap 5", "Git"],
    description: [
      "Designed a normalized schema that models employee types with ISA inheritance and foreign key constraints.",
      "Enforced business rules inside the database with triggers and stored procedures.",
      "Built a PHP back end with CRUD across 6 modules, plus session-based login with admin-only areas.",
    ],
    metrics: [],
    githubUrl: "https://github.com/TemurjonKh/db-airport_management_system",
    images: ["/media/airport-1.png", "/media/airport-2.png"],
    order: 6,
  },
];

export const volunteerUpdates = [
  {
    title: "Bilingual event staff",
    matchTitles: ["Staff"],
    org: "Try Everything (트라이 에브리싱)",
    dateLabel: "Sep 2026",
    images: ["/media/try-everything-1.jpg", "/media/try-everything-2.jpg", "/media/try-everything-3.jpg"],
    description: "Korean–English staff at Try Everything Seoul, a startup event. Interpreted between founders, investors, and attendees, and helped startups present to investors.",
  },
  {
    title: "Volunteer team lead",
    matchTitles: ["Project Manager"],
    org: "1365 Volunteer Portal",
    dateLabel: "Sep 2026",
    images: ["/media/sinwol-1.jpg", "/media/sinwol-2.jpg", "/media/sinwol-3.jpg"],
    description: "Led Team 17 of Samsung Global Hope Scholars in a session with elderly residents at the Seoul Sinwol Volunteer Center. Planned the activities over three months: greetings from our home countries and drawing national landmarks.",
  },
];

export const toProjectData = (project: ProjectCopy) => ({
  title: project.title,
  role: project.role ?? null,
  dateLabel: project.dateLabel ?? null,
  status: project.status ?? null,
  track: project.track,
  visibility: project.visibility,
  teaser: project.teaser ?? null,
  stackTagsJson: json(project.stackTags),
  descriptionJson: json(project.description),
  metricsJson: json(project.metrics),
  githubUrl: project.githubUrl ?? null,
  demoUrl: project.demoUrl ?? null,
  order: project.order,
});

/** Added to existing databases by `npm run content:update` when missing. */
export const newAchievements = [
  { title: "Hackathon 2nd place: Maple", description: "Team project, a sponsorship marketplace live at mapleapp.tech" },
];
