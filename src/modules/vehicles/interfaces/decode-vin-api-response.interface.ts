export interface DecodeVinApiEntry {
  Value: string | null;
  ValueId: string | null;
  Variable: string | null;
  VariableId: number;
}

export interface DecodeVinApiResponse {
  Results: DecodeVinApiEntry[];
}
