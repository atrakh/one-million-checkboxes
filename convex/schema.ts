import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  checkboxes: defineTable({
    idx: v.number(),
    boxes: v.bytes(),
  }).index("idx", ["idx"]),
});
