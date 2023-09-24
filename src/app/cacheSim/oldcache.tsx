"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  TextField,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CacheTable from "./components/cacheTable";
import {
  checkCache,
  initCache,
  initAccessOrder,
  updateCache,
  updateCacheLRU,
} from "./utils/cache";
import { CacheCheck } from "./cache.interfaces";
import { useForm, Controller } from "react-hook-form";
import { ECachePolicy, EReplacementAlgorithm } from "./utils/cache";

const schema = z.object({
  cacheLines: z
    .number()
    .min(1, "Debe ser un número positivo")
    .int()
    .refine((value) => value !== undefined, {
      message: "Este campo es requerido",
    }),
  wordsPerBlock: z
    .number()
    .min(1, "Debe ser un número positivo")
    .int()
    .refine((value) => value !== undefined, {
      message: "Este campo es requerido",
    }),
  addressesToCheck: z.string().refine((value) => value !== undefined, {
    message: "Este campo es requerido",
  }),
});

const CacheSimPage = () => {
  const { control, trigger, watch } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange", // Activa la validación automáticamente al cambiar los valores
    defaultValues: {
      cachePolicy: ECachePolicy.DirectMapped,
      replacementAlgorithm: EReplacementAlgorithm.FIFO,
      showHits: true,
      cacheLines: 4,
      wordsPerBlock: 16,
      addressesToCheck:
        "22, 23, 24, 22, 12, 53, 25, 8, 73, 34, 35, 93, 86, 119, 36, 25, 94, 120, 26, 95",
    },
  });

  const {
    cacheLines,
    wordsPerBlock,
    addressesToCheck,
    showHits,
    cachePolicy,
    replacementAlgorithm,
  } = watch();

  const [results, setResults] = useState<CacheCheck[]>([]);
  const initialCacheRef = useRef<number[][]>([[]]);

  useEffect(() => {
    const calculateResults = async () => {
      const isValid = await trigger();
      if (!isValid) {
        return;
      }

      const cacheContents = initCache(cacheLines, wordsPerBlock);

      const newResults: CacheCheck[] = [];

      const addressesArray = addressesToCheck.split(",").map(Number);

      const isLRU =
        cachePolicy !== CachePolicy.DirectMapped &&
        replacementAlgorithm === ReplacementAlgorithm.LRU;

      let cacheMissCount = 0;

      // Genera consecutivamente, quizas haya que pasarlo a un metodo
      for (let i = 0; i < cacheLines * wordsPerBlock; i++) {
        const cacheLineIndex = Math.floor(i / wordsPerBlock);
        const wordIndex = i % wordsPerBlock;

        if (cacheContents[cacheLineIndex][wordIndex] === 0) {
          cacheContents[cacheLineIndex][wordIndex] = i;
        }
      }

      initialCacheRef.current = JSON.parse(JSON.stringify(cacheContents));

      //Hasta aqui no cambia nada

      const accessOrder: number[] = isLRU // Only for LRU
        ? initAccessOrder(cacheLines, addressesArray.length)
        : [];

      let position: number = 0; // Only for LRU

      addressesArray.forEach((address: any) => {
        const block = Math.floor(address / wordsPerBlock);

        const label = Math.floor(block / cacheLines);

        const cacheIndex = checkCache(address, cacheContents, wordsPerBlock);

        let line = isLRU && cacheIndex !== -1 ? cacheIndex : 0;

        if (isLRU) {
          accessOrder[position + cacheLines] = line;
        }

        const success = cacheIndex !== -1;

        if (!success) {
          cacheMissCount++;

          if (cachePolicy !== CachePolicy.DirectMapped) {
            // Verifica el algoritmo de reemplazo seleccionado y realiza la actualización adecuada
            switch (replacementAlgorithm) {
              case ReplacementAlgorithm.FIFO:
                break;
              case ReplacementAlgorithm.LRU:
                line = block % cacheLines;
                let buscamosPosicion = 0;
                let encontrado = false;
                while (
                  buscamosPosicion < position + cacheLines &&
                  !encontrado
                ) {
                  if (accessOrder[buscamosPosicion] != -1) {
                    line = accessOrder[buscamosPosicion];
                    encontrado = true;
                  } else buscamosPosicion++;
                }

                accessOrder[position + cacheLines] = line;
                for (let i = 0; i < wordsPerBlock; i++) {
                  cacheContents[line][i] = block * wordsPerBlock + i;
                }
                break;
              default:
                break;
            }
          } else {
            updateCache(cacheContents, line, block, wordsPerBlock);
          }
        }

        newResults.push({
          address,
          line,
          label,
          block,
          blockAddresses: {
            rangeMin: block * wordsPerBlock,
            rangeMax: block * wordsPerBlock + wordsPerBlock - 1,
          },
          hit: success,
        });

        if (isLRU) {
          for (let i = 0; i < position + cacheLines; i++) {
            if (accessOrder[i] === line) {
              accessOrder[i] = -1;
            }
          }
          position++;
        }
      });

      setResults(newResults);
    };

    calculateResults();
  }, [
    cacheLines,
    wordsPerBlock,
    addressesToCheck,
    trigger,
    cachePolicy,
    replacementAlgorithm,
  ]);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ m: 2 }}>
          Simulador de Caché
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <Controller
              name="cacheLines"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    label="Líneas de cache"
                    variant="outlined"
                    value={cacheLines.toString()}
                    type="number"
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                    fullWidth
                  />
                  {fieldState.error && (
                    <span className="error">{fieldState.error.message}</span>
                  )}
                </>
              )}
            />
          </Grid>
          <Grid item xs={2}>
            <Controller
              name="wordsPerBlock"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    label="Palabras por Bloque"
                    variant="outlined"
                    type="number"
                    value={wordsPerBlock.toString()}
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                    fullWidth
                  />
                  {fieldState.error && (
                    <span className="error">{fieldState.error.message}</span>
                  )}
                </>
              )}
            />
          </Grid>

          <Grid item xs={3}>
            <Controller
              name="cachePolicy"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Política de Asignación"
                  select
                  variant="outlined"
                  fullWidth
                >
                  <MenuItem value={CachePolicy.DirectMapped}>Directa</MenuItem>
                  {/* <MenuItem value={CachePolicy.SetAssociative}>Asociativa por Conjuntos</MenuItem> */}
                  <MenuItem value={CachePolicy.FullyAssociative}>
                    Completamente Asociativa
                  </MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {cachePolicy !== CachePolicy.DirectMapped && (
            <Grid item xs={3}>
              <Controller
                name="replacementAlgorithm"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Algoritmo de reemplazo"
                    select
                    variant="outlined"
                    fullWidth
                  >
                    <MenuItem value={ReplacementAlgorithm.FIFO}>FIFO</MenuItem>
                    <MenuItem value={ReplacementAlgorithm.LRU}>LRU</MenuItem>
                    {/* <MenuItem value={ReplacementAlgorithm.LFU}>LFU</MenuItem> */}
                    {/* <MenuItem value={ReplacementAlgorithm.Random}>Aleatorio</MenuItem> */}
                  </TextField>
                )}
              />
            </Grid>
          )}
          <Grid item xs={9}>
            <Controller
              name="addressesToCheck"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    label="Lecturas a memoria (separado por COMAS)"
                    variant="outlined"
                    value={addressesToCheck}
                    fullWidth
                  />
                  {fieldState.error && (
                    <span className="error">{fieldState.error.message}</span>
                  )}
                </>
              )}
            />
          </Grid>
          <Grid item xs={3}>
            <Controller
              name="showHits"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControlLabel
                    label="Mostrar aciertos"
                    control={
                      <Switch
                        checked={showHits}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                        }}
                        color="primary"
                      />
                    }
                  />
                </>
              )}
            />
          </Grid>
        </Grid>
        <br />
        <CacheTable
          initialState={initialCacheRef.current}
          addressesToCheck={addressesToCheck.split(",").map(Number)}
          numberOfLines={cacheLines}
          cacheCheckData={results}
          showHits={showHits}
        />
      </Box>
    </Container>
  );
};
