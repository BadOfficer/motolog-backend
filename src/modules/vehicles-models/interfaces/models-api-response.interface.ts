export interface ModelsApiResponseEntry {
  Model_ID: number;
  Model_Name: string;
}

export interface ModelsApiResponse {
  Results: ModelsApiResponseEntry[];
}
