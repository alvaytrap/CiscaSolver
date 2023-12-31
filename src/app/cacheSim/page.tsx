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
import { CacheCheck } from "./cache.interfaces";
import { useForm, Controller } from "react-hook-form";
import { ECachePolicy, EReplacementAlgorithm } from "./utils/cache";
import CacheSimulator from "./cacheSim";

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

      const simulator = new CacheSimulator(
        cachePolicy,
        replacementAlgorithm,
        cacheLines,
        wordsPerBlock,
        addressesToCheck,
      );

      const {newResults, cacheMissCount, initialCacheContents} = simulator.runSimulation();
      initialCacheRef.current = initialCacheContents;
      console.log(newResults);
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
                  <MenuItem value={ECachePolicy.DirectMapped}>Directa</MenuItem>
                  {/* <MenuItem value={CachePolicy.SetAssociative}>Asociativa por Conjuntos</MenuItem> */}
                  <MenuItem value={ECachePolicy.FullyAssociative}>
                    Completamente Asociativa
                  </MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {cachePolicy !== ECachePolicy.DirectMapped && (
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
                    <MenuItem value={EReplacementAlgorithm.FIFO}>FIFO</MenuItem>
                    <MenuItem value={EReplacementAlgorithm.LRU}>LRU</MenuItem>
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

export default CacheSimPage;
