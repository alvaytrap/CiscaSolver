import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import "./CacheTable.css";
import { CacheCheck } from "../cache.interfaces";

interface CacheTableProps {
  addressesToCheck: number[];
  numberOfLines: number;
  cacheCheckData: CacheCheck[];
  initialState: number[][];
  showHits: boolean;
}

const CacheTable = ({
  initialState,
  addressesToCheck,
  numberOfLines,
  cacheCheckData,
  showHits,
}: CacheTableProps) => {
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (initialState && addressesToCheck && cacheCheckData) {
      setDataReady(true);
    }
  }, [initialState, addressesToCheck, cacheCheckData]);

  if (!dataReady) {
    return <div>Cargando datos...</div>;
  }

  const lines = Array.from({ length: numberOfLines }, (_, i) => i);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: "100%",
        width: "100%",
        overflowX: "auto",
      }}
    >
      <Table
        className="custom-table"
        sx={{
          width: 1000,
          "& .MuiTableCell-root": {
            borderLeft: "1px solid #ccc",
            width: `${1000 / (cacheCheckData.length + 2)}px`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Line</TableCell>
            <TableCell>Estado Inicial</TableCell>
            {cacheCheckData.map(
              (cacheCheck, index) =>
                (showHits || !cacheCheck.hit) && (
                  <TableCell key={`H${index}`}>
                    {cacheCheck.hit
                      ? `${cacheCheck.address}`
                      : `Fallo: ${cacheCheck.address}`}
                  </TableCell>
                )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line, index) => (
            <TableRow key={`R${index}`}>
              <TableCell>{line}</TableCell>
              <TableCell>
                {line}:0 (
                {initialState[line]
                  ? `${initialState[line][0]} - ${
                      initialState[line][initialState[line].length - 1]
                    }`
                  : "N/A"}
                )
              </TableCell>
              {cacheCheckData.map(
                (cacheCheck, index) =>
                  (showHits || !cacheCheck.hit) && (
                    <TableCell key={`C${index}`}>
                      {cacheCheck.line === line
                        ? cacheCheck.hit
                          ? "E"
                          : `${cacheCheck.block}:${cacheCheck.label} (${cacheCheck.blockAddresses.rangeMin} - ${cacheCheck.blockAddresses.rangeMax})`
                        : ""}
                    </TableCell>
                  )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CacheTable;
