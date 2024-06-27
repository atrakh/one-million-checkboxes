import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poison the well",
  { seconds: 10 },
  internal.checkboxes.toggleRandom
);

export default crons;
