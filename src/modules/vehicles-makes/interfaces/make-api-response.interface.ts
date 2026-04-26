export interface MakeApiResponseEntry {
  MakeName: string;
  MakeId: number;
}

export interface MakeApiResponse {
  Results: MakeApiResponseEntry[];
}
