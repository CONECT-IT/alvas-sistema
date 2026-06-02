export type AccionResumen = Readonly<{
  evento: string;
  total: number;
}>;

/** @group Entidades */
export class ResumenAcciones {
  constructor(
    readonly acciones: ReadonlyArray<AccionResumen>,
    readonly totalAcciones: number,
  ) {}
}
