'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, TextField, Typography, Box } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CacheTable from './components/cacheTable';
import {
	calculateBlockAndLine,
	checkCache,
	initializeCache,
	updateCache,
} from './utils/cache';
import { CacheCheck } from './cache.interfaces';
import { useForm, Controller } from 'react-hook-form';

const schema = z.object({
	cacheLines: z
		.number()
		.min(1, 'Debe ser un número positivo')
		.int()
		.refine(value => value !== undefined, {
			message: 'Este campo es requerido',
		}),
	wordsPerLine: z
		.number()
		.min(1, 'Debe ser un número positivo')
		.int()
		.refine(value => value !== undefined, {
			message: 'Este campo es requerido',
		}),
	addressesToCheck: z.string().refine(value => value !== undefined, {
		message: 'Este campo es requerido',
	}),
});

const CacheSimPage = () => {
	const {
		control,
		trigger,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		mode: 'onChange', // Activa la validación automáticamente al cambiar los valores
		defaultValues: {
			cacheLines: 4,
			wordsPerLine: 4,
			addressesToCheck:
				'22, 23, 24, 22, 12, 53, 25, 8, 73, 34, 35, 93, 86, 119, 36, 25, 94, 120, 26, 95',
		},
	});

	const cacheLines = watch('cacheLines');
	const wordsPerLine = watch('wordsPerLine');
	const addressesToCheck = watch('addressesToCheck');

	const [results, setResults] = useState<CacheCheck[]>([]);
	const initialCacheRef = useRef<number[][]>([[]]);

	useEffect(() => {
		const calculateResults = async () => {
			const isValid = await trigger();
			if (!isValid) {
				return;
			}

			const cacheContents: number[][] = initializeCache(
				cacheLines,
				wordsPerLine
			);

			for (let i = 0; i < cacheLines * wordsPerLine; i++) {
				const cacheLineIndex = Math.floor(i / wordsPerLine);
				const wordIndex = i % wordsPerLine;

				if (cacheContents[cacheLineIndex][wordIndex] === 0) {
					cacheContents[cacheLineIndex][wordIndex] = i;
				}
			}

			initialCacheRef.current = JSON.parse(JSON.stringify(cacheContents));

			const newResults: CacheCheck[] = [];
			let cacheMissCount = 0;

			const addressesArray = addressesToCheck.split(',').map(Number);

			addressesArray.forEach((address: any) => {
				const { block, line, label } = calculateBlockAndLine(
					address,
					wordsPerLine,
					cacheLines
				);
				const cacheIndex = checkCache(address, cacheContents, wordsPerLine);
				const success = cacheIndex !== -1;

				if (!success) {
					cacheMissCount++;
					updateCache(cacheContents, line, block, wordsPerLine);
				}

				newResults.push({
					address,
					line,
					label,
					block,
					blockAddresses: {
						rangeMin: block * wordsPerLine,
						rangeMax: block * wordsPerLine + wordsPerLine - 1,
					},
					hit: success,
				});
			});

			setResults(newResults);
		};

		calculateResults();
	}, [cacheLines, wordsPerLine, addressesToCheck, trigger]);

	return (
		<Container>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Typography variant='h4' sx={{ m: 2 }}>
					Simulador de Caché
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={2}>
						<Controller
							name='cacheLines'
							control={control}
							render={({ field, fieldState }) => (
								<>
									<TextField
										{...field}
										label='Lineas de cache'
										variant='outlined'
										value={cacheLines.toString()}
										type='number'
										onChange={e => {
											field.onChange(+e.target.value);
										}}
										fullWidth
									/>
									{fieldState.error && (
										<span className='error'>{fieldState.error.message}</span>
									)}
								</>
							)}
						/>
					</Grid>
					<Grid item xs={2}>
						<Controller
							name='wordsPerLine'
							control={control}
							render={({ field, fieldState }) => (
								<>
									<TextField
										{...field}
										label='Words Per Line'
										variant='outlined'
										type='number'
										value={wordsPerLine.toString()}
										onChange={e => {
											field.onChange(+e.target.value);
										}}
										fullWidth
									/>
									{fieldState.error && (
										<span className='error'>{fieldState.error.message}</span>
									)}
								</>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='addressesToCheck'
							control={control}
							render={({ field, fieldState }) => (
								<>
									<TextField
										{...field}
										label='Addresses To Check (comma-separated)'
										variant='outlined'
										value={addressesToCheck}
										fullWidth
									/>
									{fieldState.error && (
										<span className='error'>{fieldState.error.message}</span>
									)}
								</>
							)}
						/>
					</Grid>
				</Grid>
				<br />
				<CacheTable
					initialState={initialCacheRef.current}
					addressesToCheck={addressesToCheck.split(',').map(Number)}
					numberOfLines={cacheLines}
					cacheCheckData={results}
				/>
			</Box>
		</Container>
	);
};

export default CacheSimPage;
