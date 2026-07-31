import { get, unwrapOrThrow, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ApportionmentResponse,
  GetApportionmentParams,
} from "@/types/apportionments.types";

export async function getApportionments(
  params?: GetApportionmentParams
): Promise<ApportionmentResponse> {
  const url = buildListUrl("/apportionments", params ?? {});
  const res: ApiResult<ApportionmentResponse> = await get(url);
  return unwrapOrThrow(res);
}
