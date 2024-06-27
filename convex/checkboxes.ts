import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { GenericMutationCtx } from "convex/server";
import { DataModel } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const NUM_BOXES = 1000000;
export const BOXES_PER_DOCUMENT = 4000;
export const NUM_DOCUMENTS = Math.floor(NUM_BOXES / BOXES_PER_DOCUMENT);

export const get = query({
  args: { documentIdx: v.number() },
  handler: async (ctx, { documentIdx }) => {
    if (documentIdx < 0 || documentIdx >= NUM_DOCUMENTS) {
      throw new Error("documentIdx out of range");
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

const toggleHandler = async (
  ctx: GenericMutationCtx<DataModel>,
  {
    documentIdx,
    arrayIdx,
    checked,
  }: {
    documentIdx: number;
    arrayIdx: number;
    checked: boolean;
  }
) => {
  if (documentIdx < 0 || documentIdx >= NUM_DOCUMENTS) {
    throw new Error("documentIdx out of range");
  }
  if (arrayIdx < 0 || arrayIdx >= BOXES_PER_DOCUMENT) {
    throw new Error("arrayIdx out of range");
  }
  const checkbox = await ctx.db
    .query("checkboxes")
    .withIndex("idx", (q) => q.eq("idx", documentIdx))
    .first();

  if (!checkbox) {
    return;
  }

  const bytes = checkbox.boxes;
  const view = new Uint8Array(bytes);
  const newBytes = shiftBit(view, arrayIdx, checked)?.buffer;

  if (newBytes) {
    ctx.db.patch(checkbox._id, {
      idx: checkbox.idx,
      boxes: newBytes,
    });
  }
};

export const toggle = mutation({
  args: { documentIdx: v.number(), arrayIdx: v.number(), checked: v.boolean() },
  handler: toggleHandler,
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

export const toggleRandom = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (let i = 0; i < 10; i++) {
      const documentIdx = Math.floor(Math.random() * NUM_DOCUMENTS);
      const arrayIdx = Math.floor(Math.random() * 2);
      const box = await ctx.db
        .query("checkboxes")
        .withIndex("idx", (q) => q.eq("idx", documentIdx))
        .first();
      if (box) {
        const jitter = Math.random() * 100000;
        ctx.scheduler.runAfter(jitter, api.checkboxes.toggle, {
          documentIdx,
          arrayIdx,
          checked: !isChecked(new Uint8Array(box.boxes), arrayIdx),
        });
      }
    }
  },
});

export const isChecked = (view: Uint8Array, arrayIdx: number) => {
  const bit = arrayIdx % 8;
  const uintIdx = Math.floor(arrayIdx / 8);
  const byte = view ? view[uintIdx] : 0;
  const shiftedBit = 1 << bit;
  return !!(shiftedBit & byte);
};

export const shiftBit = (
  view: Uint8Array,
  arrayIdx: number,
  checked: boolean
) => {
  const bit = arrayIdx % 8;
  const uintIdx = Math.floor(arrayIdx / 8);
  const byte = view[uintIdx];
  const shiftedBit = 1 << bit;
  const isCurrentlyChecked = isChecked(view, arrayIdx);

  // If the bit is already in the correct state, do nothing to avoid OCC.
  if (isCurrentlyChecked === checked) {
    return;
  }

  view[uintIdx] = shiftedBit ^ byte;
  return view;
};
