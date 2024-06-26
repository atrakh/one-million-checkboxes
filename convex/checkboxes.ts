import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const NUM_BOXES = 1000000;
export const BOXES_PER_DOCUMENT = 8000;
export const NUM_DOCUMENTS = Math.floor(NUM_BOXES / BOXES_PER_DOCUMENT);

export const get = query({
  args: { documentIdx: v.number() },
  handler: async (ctx, { documentIdx }) => {
    if (documentIdx < 0 || documentIdx >= NUM_DOCUMENTS) {
      throw new Error("idx out of range");
    }
    return (
      await ctx.db
        .query("checkboxes")
        .withIndex("idx", (q) => q.eq("idx", documentIdx))
        .order("asc")
        .first()
    )?.boxes;
  },
});

export const toggle = mutation({
  args: { documentIdx: v.number(), arrayIdx: v.number(), checked: v.boolean() },
  handler: async (ctx, { documentIdx, arrayIdx, checked }) => {
    const checkbox = await ctx.db
      .query("checkboxes")
      .withIndex("idx", (q) => q.eq("idx", documentIdx))
      .first();

    if (!checkbox) {
      return;
    }

    const bytes = checkbox.boxes;
    const view = new Uint8Array(bytes);
    const bit = arrayIdx % 8;
    const byte = view[arrayIdx / 8];
    const bitValue = (byte >> bit) & 1;

    if (bitValue === (checked ? 1 : 0)) {
      return;
    }

    view[arrayIdx / 8] = byte ^ (1 << bit);

    ctx.db.patch(checkbox._id, {
      idx: checkbox.idx,
      boxes: view.buffer,
    });
  },
});

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const boxes = await ctx.db
      .query("checkboxes")
      .withIndex("idx")
      .order("asc")
      .collect();
    // Clear the table.
    for (const box of boxes) {
      await ctx.db.delete(box._id);
    }

    const bytes = new Uint8Array(BOXES_PER_DOCUMENT / 8);

    // Reset the table.
    for (let i = 0; i < NUM_DOCUMENTS; i++) {
      await ctx.db.insert("checkboxes", {
        idx: i,
        boxes: bytes.buffer,
      });
    }
  },
});
