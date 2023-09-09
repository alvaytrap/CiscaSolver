export interface CacheCheck {
    address: number;
    line: number;
    block: number;
    label?: number;
    blockAddresses: {
      rangeMin: number;
      rangeMax: number;
    };
    hit: boolean;
  }
