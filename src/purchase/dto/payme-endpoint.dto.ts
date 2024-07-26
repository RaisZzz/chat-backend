interface AccountI {
  order: number;
  phone: string;
}

interface ParamsI {
  amount?: number;
  account?: AccountI;
  id?: string;
  time?: number;
  reason?: number;
}

export class PaymeEndpointDto {
  readonly jsonrpc: string;

  readonly id: number;

  readonly method: string;

  readonly params: ParamsI;
}
