import { DECODE_VIN_ENTRIES } from '../constants/decode-vin-entries';

type DecodeVinType = typeof DECODE_VIN_ENTRIES;

export type DecodeVinItem = {
  [K in keyof DecodeVinType]: string | null;
};

export interface DecodeVinResponse extends DecodeVinItem {
  vin: string;
  success: boolean;
}
