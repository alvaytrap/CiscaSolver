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
import "./CacheTable.css"; // Importa tu archivo CSS personalizado
import { CacheCheck } from "../cache.interfaces";

interface CacheTableProps {
  addressesToCheck: number[];
  numberOfLines: number;
  cacheCheckData: CacheCheck[];
  initialState: number[][];
}

const CacheTable = ({
  initialState,
  addressesToCheck,
  numberOfLines,
  cacheCheckData,
}: CacheTableProps) => {
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // Realiza algún proceso para determinar si los datos están listos
    if (initialState && addressesToCheck && cacheCheckData) {
      setDataReady(true);
    }
  }, [initialState, addressesToCheck, cacheCheckData]);

  // Genera un array de números secuenciales desde 0 hasta numberOfLines - 1
  const lines = Array.from({ length: numberOfLines }, (_, i) => i);

  if (!dataReady) {
    return <div>Cargando datos...</div>;
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: "100%",
        width: "100%",
        overflowX: "auto", // Habilitar la barra de desplazamiento horizontal
      }}
    >
      <Table
        className="custom-table"
        sx={{
          width: 1000, // Ancho fijo deseado para la tabla
          "& .MuiTableCell-root": {
            borderLeft: "1px solid #ccc",
            width: `${1000 / (cacheCheckData.length + 2)}px`, // Dividir el ancho por el número de columnas
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Line</TableCell>
            <TableCell>Estado Inicial</TableCell>
            {cacheCheckData.map((cacheCheck, index) => (
              <TableCell key={`H${index}`}>
                {cacheCheck.hit
                  ? `${cacheCheck.address}`
                  : `Fallo: ${cacheCheck.address}`}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line, index) => (
            <TableRow key={`R${index}`}>
              <TableCell>{line}</TableCell>
              <TableCell>
                {line}:0 (
                {initialState[line]
                  ? `${initialState[line][0]} - ${initialState[line][
                      initialState[line].length - 1
                    ]}`
                  : "N/A"}
                )
              </TableCell>
              {cacheCheckData.map((cacheCheck, index) => (
                <TableCell key={`C${index}`}>
                  {cacheCheck.line === line
                    ? cacheCheck.hit
                      ? "E"
                      : `${cacheCheck.block}:${cacheCheck.label} (${cacheCheck.blockAddresses.rangeMin} - ${cacheCheck.blockAddresses.rangeMax})`
                    : ""}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CacheTable;