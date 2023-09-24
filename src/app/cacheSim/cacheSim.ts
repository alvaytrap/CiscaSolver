import { CacheCheck } from "./cache.interfaces";
import {
  initCache,
  initAccessOrder,
  checkCache,
  ECachePolicy,
  EReplacementAlgorithm,
} from "./utils/cache";

class CacheSimulator {
  private cachePolicy: ECachePolicy;
  private replacementAlgorithm: EReplacementAlgorithm;
  private cacheLines: number;
  private wordsPerBlock: number;
  private cacheContents: number[][];
  private initialCacheContents: number[][];
  private addressesArray: number[];
  private isLRU: boolean;
  private cacheMissCount: number = 0;

  constructor(
    cachePolicy: ECachePolicy,
    replacementAlgorithm: EReplacementAlgorithm,
    cacheLines: number,
    wordsPerBlock: number,
    addressesToCheck: string,
  ) {
    this.cachePolicy = cachePolicy;
    this.replacementAlgorithm = replacementAlgorithm;
    this.cacheLines = cacheLines;
    this.wordsPerBlock = wordsPerBlock;
    this.cacheContents = initCache(cacheLines, wordsPerBlock);


    for (let i = 0; i < this.cacheLines * this.wordsPerBlock; i++) {
      const cacheLineIndex = Math.floor(i / this.wordsPerBlock);
      const wordIndex = i % this.wordsPerBlock;

      if (this.cacheContents[cacheLineIndex][wordIndex] === 0) {
        this.cacheContents[cacheLineIndex][wordIndex] = i;
      }
    }

    this.initialCacheContents = JSON.parse(
      JSON.stringify(this.cacheContents)
    );

    this.addressesArray = addressesToCheck.split(",").map(Number);
    this.isLRU =
      cachePolicy !== ECachePolicy.DirectMapped &&
      replacementAlgorithm === EReplacementAlgorithm.LRU;
  }

  private initializeAccessOrder(): number[] {
    // Inicializa el orden de acceso según el algoritmo seleccionado.
    return this.isLRU
      ? initAccessOrder(this.cacheLines, this.addressesArray.length)
      : [];
  }

  public runSimulation(): { newResults: CacheCheck[], cacheMissCount: number, initialCacheContents: number[][] } {
    const newResults: CacheCheck[] = [];
    const accessOrder = this.initializeAccessOrder();
    let position = 0;


    this.addressesArray.forEach((address) => {
      const block = Math.floor(address / this.wordsPerBlock);
      const label = Math.floor(block / this.cacheLines);
      const cacheIndex = checkCache(
        address,
        this.cacheContents,
        this.wordsPerBlock
      );

      console.log("cacheIndex", cacheIndex)

      let line = block % this.cacheLines;


      const success = cacheIndex !== -1;

      if (this.isLRU && success) {
        line = cacheIndex;
        accessOrder[position + this.cacheLines] = line;
      }


      if (!success) {
        this.cacheMissCount++
        // Actualizar el caché según el algoritmo seleccionado.
        if (this.cachePolicy !== ECachePolicy.DirectMapped) {
          // Actualizar el caché según el algoritmo de reemplazo seleccionado.
          // Puedes implementar otros algoritmos aquí en el futuro.
          switch (this.replacementAlgorithm) {
            case EReplacementAlgorithm.FIFO:
              // Implementar FIFO aquí
              break;
            case EReplacementAlgorithm.LRU:
              let searchPosition = 0;
              let found = false;
              while (searchPosition < position + this.cacheLines && !found) {
                if (accessOrder[searchPosition] !== -1) {
                  line = accessOrder[searchPosition];
                  found = true;
                } else {
                  searchPosition++;
                }
              }

              accessOrder[position + this.cacheLines] = line;


              break;
            default:
              break;
          }
        }
        for (let i = 0; i < this.wordsPerBlock; i++) {
          this.cacheContents[line][i] = block * this.wordsPerBlock + i;
        }
      }

      newResults.push({
        address,
        line,
        label,
        block,
        blockAddresses: {
          rangeMin: block * this.wordsPerBlock,
          rangeMax: block * this.wordsPerBlock + this.wordsPerBlock - 1,
        },
        hit: success,
      });

      if (this.isLRU) {
        for (let i = 0; i < position + this.cacheLines; i++) {
          if (accessOrder[i] === line) {
            accessOrder[i] = -1;
          }
        }
        position++;
      }
    });

    return { newResults, cacheMissCount: this.cacheMissCount, initialCacheContents: this.initialCacheContents };
  }
}

export default CacheSimulator;