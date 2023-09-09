  export enum CacheType {
    DirectMapped,
    SetAssociative,
    FullyAssociative,
  }
  
  export enum ReplacementAlgorithm {
    FIFO,
    LRU,
    LFU,
    Random,
  }

export function initializeCache(lines:number, words:number) {
  return Array.from({ length: lines }, () => Array(words).fill(0));
}

export function calculateBlockAndLine(address:number, wordsPerLine:number, cacheLines:number) {
  const block = Math.floor(address / wordsPerLine);
  const line = block % cacheLines;
  const label = Math.floor(block / cacheLines);
  return { block, line, label };
}

export function updateCache(cacheContents:number[][], line:number, block:number, wordsPerLine:number) {
  for (let i = 0; i < wordsPerLine; i++) {
    cacheContents[line][i] = block * wordsPerLine + i;
  }
}

export function checkCache(address:number, cacheContents:number[][], wordsPerLine:number) {
    for (let i = 0; i < cacheContents.length; i++) {
      if (address >= cacheContents[i][0] && address <= cacheContents[i][wordsPerLine - 1]) {
        return i;
      }
    }
    return -1;
  }



