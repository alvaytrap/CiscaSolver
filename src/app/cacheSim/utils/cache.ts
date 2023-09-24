export enum ECachePolicy {
  DirectMapped,
  SetAssociative,
  FullyAssociative,
}

export enum EReplacementAlgorithm {
  FIFO,
  LRU,
  LFU,
  Random,
}

export function initCache(
  lines: number,
  words: number,
): number[][] {
  return Array.from({ length: lines }, () => Array(words).fill(0));
}

export function initAccessOrder(
  lines: number,
  numAddresses: number,
): number[] {
  const temp = Array(lines+numAddresses).fill(0);
  for (let i = 0; i < lines; i++) {
    temp[i] = i;
  } 

  for(let i = lines; i < lines+numAddresses; i++){
    temp[i] = -1;
  }

  return  temp;
}

// export function calculateBlockAndLine(address: number, wordsPerLine: number, cacheLines: number) {

//   return { block, line, label };
// }

// export function updateCache(cacheContents: number[][], line: number, block: number, wordsPerLine: number) {
//   for (let i = 0; i < wordsPerLine; i++) {
//     cacheContents[line][i] = block * wordsPerLine + i;
//   }
// }

export function updateCacheLRU(
  cacheContents: number[][],
  cacheLines: number,
  line: number,
  block: number,
  wordsPerLine: number,
  position: number,
  accessOrder: number[],
) {
  let buscamosPosicion=0;
  let encontrado=false;
  while (buscamosPosicion< position+cacheLines && !encontrado){
      if (accessOrder[buscamosPosicion]!=-1){
          line=accessOrder[buscamosPosicion];
          encontrado=true;
      }else 
          buscamosPosicion++;
  }

  accessOrder[position+cacheLines] = line;
  for (let i = 0; i < wordsPerLine; i++) {
    cacheContents[line][i] = block * wordsPerLine + i;
  }
}

export function checkCache(address: number, cacheContents: number[][], wordsPerLine: number) {
  for (let i = 0; i < cacheContents.length; i++) {
    if (address >= cacheContents[i][0] && address <= cacheContents[i][wordsPerLine - 1]) {
      return i;
    }
  }
  return -1;
}

// export function updateCacheFIFO(cacheContents: number[][], line: number, block: number, wordsPerLine: number) {
//   // Obtén la cola para la línea de caché actual (puede ser un array)
//   const cacheQueue = cacheContents[line];

//   // Encola el nuevo bloque al final de la cola
//   cacheQueue.push(block);

//   // Si la cola tiene más elementos de los que puede contener la línea de caché,
//   // elimina el bloque más antiguo (el primero en la cola)
//   if (cacheQueue.length > wordsPerLine) {
//     cacheQueue.shift(); // Elimina el bloque más antiguo (FIFO)
//   }
// }







