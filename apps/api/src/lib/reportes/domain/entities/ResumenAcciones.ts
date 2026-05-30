export type AccionResumen = Readonly<{
  evento: string;
  total: number;
}>;

export class ResumenAcciones {
  constructor(
    readonly acciones: ReadonlyArray<AccionResumen>,
    readonly totalAcciones: number,
  ) {}
}
