import { DECODE_VIN_ENTRIES } from '../constants/decode-vin-entries';
import {
  DecodeVinItem,
  DecodeVinResponse,
} from '../interfaces/decode-vin-response.interface';
import { DecodeVinApiResponse } from '../interfaces/decode-vin-api-response.interface';

const VIN_ID_TO_KEY = Object.fromEntries(
  Object.entries(DECODE_VIN_ENTRIES).map(([key, value]) => [value, key]),
) as Record<number, keyof DecodeVinResponse>;

export function parseVinResults(
  apiResult: DecodeVinApiResponse,
  initialState: DecodeVinItem,
): DecodeVinItem {
  const data = apiResult.Results;

  return data.reduce(
    (parsedRes, curItem) => {
      const key = VIN_ID_TO_KEY[curItem.VariableId];

      if (key) {
        parsedRes[key] = curItem.Value;
      }

      return parsedRes;
    },
    { ...initialState },
  );
}
