import { FixedSizeGrid as Grid } from "react-window";
import { useMutation, useQueries } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  BOXES_PER_DOCUMENT,
  NUM_BOXES,
  NUM_DOCUMENTS,
} from "../convex/checkboxes";
import React, { useMemo } from "react";
import { useMeasure } from "react-use";

function App() {
  const queries = useMemo(
    () =>
      Array(NUM_DOCUMENTS)
        .fill(null)
        .map((_, idx) => ({
          query: api.checkboxes.get,
          args: { documentIdx: idx },
        }))
        .reduce(
          (acc, curr) => ({ ...acc, [curr.args.documentIdx.toString()]: curr }),
          {}
        ),
    []
  );

  const boxRecord = useQueries(queries);
  const boxes = Object.entries(boxRecord).map(([, value]) => value);

  const numCheckedBoxes = boxes.reduce(
    (acc, curr) =>
      acc +
      (curr === undefined
        ? 0
        : new Uint8Array(curr).reduce(
            (acc, curr) => acc + curr.toString(2).split("1").length - 1,
            0
          )),
    0
  );

  const [ref, { width, height }] = useMeasure<HTMLDivElement>();

  const numColumns = Math.ceil((width - 40) / 30);
  const numRows = Math.ceil(NUM_BOXES / numColumns);

  return (
    <div
      key={`${width}-${height}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        height: "95vh",
        width: "99vw",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
            One Million Checkboxes
          </div>
          <div>{numCheckedBoxes} boxes checked</div>
        </div>
        <a
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "black",
          }}
          href="https://convex.dev"
          target="_blank"
        >
          Powered by
          <img src="/convex-logo.svg" width={128} />
        </a>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          flexGrow: 1,
        }}
        ref={ref}
      >
        <Grid
          columnCount={numColumns}
          columnWidth={30}
          height={height}
          rowCount={numRows}
          rowHeight={30}
          width={width}
          itemData={{ flattenedBoxes: boxes }}
        >
          {Cell}
        </Grid>
      </div>
    </div>
  );
}

const Cell = ({
  style,
  rowIndex,
  columnIndex,
  data,
}: {
  style: React.CSSProperties;
  rowIndex: number;
  columnIndex: number;
  data: { flattenedBoxes: ArrayBuffer[] };
}) => {
  const index = rowIndex * BOXES_PER_DOCUMENT + columnIndex;
  const documentIdx = index % NUM_DOCUMENTS;
  const arrayIdx = Math.floor(index / NUM_DOCUMENTS);
  const document = data.flattenedBoxes[documentIdx];
  const view = document === undefined ? undefined : new Uint8Array(document);
  const bit = arrayIdx % 8;
  const byte = view ? view[arrayIdx / 8] : 0;

  const isChecked = !!((byte >> bit) & 1);

  const isLoading = view === undefined;

  const toggle = useMutation(api.checkboxes.toggle).withOptimisticUpdate(
    (localStore) => {
      const currentValue = localStore.getQuery(api.checkboxes.get, {
        documentIdx,
      });
      if (currentValue !== undefined && currentValue !== null) {
        const view = new Uint8Array(currentValue);
        view[arrayIdx / 8] = byte ^ (1 << bit);

        localStore.setQuery(api.checkboxes.get, { documentIdx }, view);
      }
    }
  );
  const onClick = () => {
    void toggle({ documentIdx, arrayIdx, checked: !isChecked });
  };
  return (
    <div
      style={{ ...style, cursor: "pointer" }}
      key={`${rowIndex}-${columnIndex}`}
      onClick={onClick}
    >
      <input
        style={{
          margin: "0.25rem",
          cursor: isLoading ? undefined : "pointer",
          width: "24px",
          height: "24px",
        }}
        type="checkbox"
        checked={isChecked}
        disabled={isLoading}
        onChange={onClick}
      />
    </div>
  );
};
export default App;
