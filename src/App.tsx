import { FixedSizeGrid as Grid } from "react-window";
import { useMutation, useQueries } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  NUM_BOXES,
  NUM_DOCUMENTS,
  isChecked,
  shiftBit,
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
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
            <svg
              width="128px"
              height="100%"
              viewBox="0 0 600 150"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
              }}
            >
              <g>
                <path
                  d="M512.51,75.13L490.32,45.75L516.04,45.75L561.43,105.52L535.46,105.52L525.37,92.15L515.28,105.52L489.43,105.52L512.51,75.13Z"
                  style={{ fillRule: "nonzero" }}
                />
                <path
                  d="M534.89,45.75L560.49,45.75L540.84,71.92L527.84,55.15L534.89,45.75Z"
                  style={{ fillRule: "nonzero" }}
                />
              </g>
              <path
                d="M159.9,98.9C153.72,93.65 150.63,85.89 150.63,75.64C150.63,65.39 153.78,57.63 160.09,52.38C166.39,47.13 175.01,44.5 185.94,44.5C190.48,44.5 194.49,44.81 197.98,45.45C201.47,46.08 204.81,47.15 208,48.67L208,65.3C203.04,62.95 197.41,61.77 191.11,61.77C185.56,61.77 181.46,62.82 178.82,64.92C176.17,67.02 174.85,70.59 174.85,75.64C174.85,80.52 176.15,84.05 178.76,86.23C181.36,88.42 185.48,89.51 191.12,89.51C197.09,89.51 202.76,88.12 208.14,85.35L208.14,102.75C202.17,105.44 194.73,106.78 185.82,106.78C174.71,106.78 166.08,104.15 159.9,98.9Z"
                style={{ fillRule: "nonzero" }}
              />
              <path
                d="M213.52,75.63C213.52,65.46 216.42,57.73 222.22,52.43C228.02,47.13 236.76,44.49 248.45,44.49C260.22,44.49 269.02,47.14 274.87,52.43C280.71,57.72 283.63,65.46 283.63,75.63C283.63,96.39 271.9,106.77 248.45,106.77C225.16,106.78 213.52,96.4 213.52,75.63ZM256.84,86.23C258.56,84.04 259.42,80.51 259.42,75.64C259.42,70.85 258.56,67.34 256.84,65.11C255.12,62.88 252.32,61.77 248.45,61.77C244.67,61.77 241.93,62.89 240.25,65.11C238.57,67.34 237.73,70.85 237.73,75.64C237.73,80.52 238.57,84.05 240.25,86.23C241.93,88.42 244.66,89.51 248.45,89.51C252.32,89.51 255.11,88.41 256.84,86.23Z"
                style={{ fillRule: "nonzero" }}
              />
              <path
                d="M289.15,45.75L311.34,45.75L311.97,50.29C314.41,48.61 317.52,47.22 321.3,46.13C325.08,45.04 328.99,44.49 333.03,44.49C340.51,44.49 345.97,46.34 349.42,50.04C352.87,53.74 354.59,59.45 354.59,67.19L354.59,105.52L330.89,105.52L330.89,69.58C330.89,66.89 330.28,64.96 329.06,63.78C327.84,62.6 325.8,62.02 322.94,62.02C321.18,62.02 319.37,62.42 317.52,63.22C315.67,64.02 314.12,65.05 312.85,66.31L312.85,105.52L289.15,105.52L289.15,45.75Z"
                style={{ fillRule: "nonzero" }}
              />
              <path
                d="M354.66,45.75L379.37,45.75L390.72,80.8L402.07,45.75L426.78,45.75L403.2,105.52L378.23,105.52L354.66,45.75Z"
                style={{ fillRule: "nonzero" }}
              />
              <path
                d="M434.24,100.38C427.12,95.04 423.79,85.77 423.79,75.76C423.79,66.01 426.44,57.98 432.49,52.43C438.54,46.88 447.76,44.49 459.4,44.49C470.11,44.49 478.53,46.97 484.68,51.93C490.82,56.89 493.9,63.66 493.9,72.23L493.9,82.7L448.83,82.7C449.95,85.81 451.37,88.06 454.86,89.45C458.35,90.84 463.22,91.53 469.45,91.53C473.17,91.53 476.97,91.24 480.83,90.65C482.19,90.44 484.43,90.11 485.61,89.86L485.61,104.39C479.72,105.99 471.87,106.79 463.02,106.79C451.11,106.78 441.36,105.72 434.24,100.38ZM469,69.84C469,66.88 465.59,60.51 458.74,60.51C452.56,60.51 448.48,66.78 448.48,69.84L469,69.84Z"
                style={{ fillRule: "nonzero" }}
              />
              <path
                d="M100.22,100.4C113.32,98.97 125.67,92.11 132.47,80.66C129.25,108.98 97.74,126.88 72.02,115.89C69.65,114.88 67.61,113.2 66.21,111.04C60.43,102.12 58.53,90.77 61.26,80.47C69.06,93.7 84.92,101.81 100.22,100.4Z"
                style={{ fill: "rgb(243,176,28)", fillRule: "nonzero" }}
              />
              <path
                d="M60.78,72.16C55.47,84.22 55.24,98.34 61.75,109.96C38.84,93.02 39.09,56.77 61.47,40C63.54,38.45 66,37.53 68.58,37.39C79.19,36.84 89.97,40.87 97.53,48.38C82.17,48.53 67.21,58.2 60.78,72.16Z"
                style={{ fill: "rgb(141,38,118)", fillRule: "nonzero" }}
              />
              <path
                d="M104.94,52.09C97.19,41.47 85.06,34.24 71.77,34.02C97.46,22.56 129.06,41.14 132.5,68.61C132.82,71.16 132.4,73.76 131.25,76.06C126.45,85.64 117.55,93.07 107.15,95.82C114.77,81.93 113.83,64.96 104.94,52.09Z"
                style={{ fill: "rgb(238,52,47)", fillRule: "nonzero" }}
              />
            </svg>
          </a>
          <div style={{ marginLeft: "auto" }}>
            source code on{" "}
            <a
              href="https://github.com/atrakh/one-million-checkboxes"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
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
          itemData={{ flattenedBoxes: boxes, numColumns, numRows }}
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
  data: { flattenedBoxes: ArrayBuffer[]; numColumns: number; numRows: number };
}) => {
  const { flattenedBoxes, numColumns } = data;
  const index = rowIndex * numColumns + columnIndex;
  const documentIdx = index % NUM_DOCUMENTS;
  const arrayIdx = Math.floor(index / NUM_DOCUMENTS);
  const document = flattenedBoxes[documentIdx];
  const view = document === undefined ? undefined : new Uint8Array(document);

  const isCurrentlyChecked = view && isChecked(view, arrayIdx);

  const isLoading = view === undefined;

  const toggle = useMutation(api.checkboxes.toggle).withOptimisticUpdate(
    (localStore) => {
      const currentValue = localStore.getQuery(api.checkboxes.get, {
        documentIdx,
      });
      if (currentValue !== undefined && currentValue !== null) {
        const view = new Uint8Array(currentValue);
        const newBytes = shiftBit(view, arrayIdx, !isCurrentlyChecked)?.buffer;
        if (newBytes) {
          localStore.setQuery(api.checkboxes.get, { documentIdx }, newBytes);
        }
      }
    }
  );
  if (index >= NUM_BOXES) {
    return null;
  }
  const onClick = () => {
    void toggle({ documentIdx, arrayIdx, checked: !isCurrentlyChecked });
  };
  return (
    <div
      style={style}
      key={`${documentIdx}-${arrayIdx}`}
      id={`${documentIdx}-${arrayIdx}`}
    >
      <input
        style={{
          margin: "0.25rem",
          cursor: isLoading ? undefined : "pointer",
          width: "24px",
          height: "24px",
          padding: "8px",
        }}
        type="checkbox"
        checked={isCurrentlyChecked}
        disabled={isLoading}
        onChange={onClick}
      />
    </div>
  );
};
export default App;
