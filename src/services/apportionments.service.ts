import { get, put, post, unwrapOrThrow, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ApportionmentResponse,
  GetApportionmentParams,
  ApportionmentConfig,
  ApportionmentSnapshotItem,
  ApportionmentSnapshotDetail,
} from "@/types/apportionments.types";

export async function getApportionments(
  params?: GetApportionmentParams
): Promise<ApportionmentResponse> {
  const url = buildListUrl("/apportionments", params ?? {});
  const res: ApiResult<ApportionmentResponse> = await get(url);
  return unwrapOrThrow(res);
}

export async function getApportionmentConfigs(): Promise<ApportionmentConfig[]> {
  const res: ApiResult<ApportionmentConfig[]> = await get("/apportionments/config");
  return unwrapOrThrow(res);
}

export async function updateApportionmentConfig(data: {
  calculationDay: number;
  calculationType: string;
}): Promise<ApportionmentConfig> {
  const res: ApiResult<ApportionmentConfig> = await put("/apportionments/config", data);
  return unwrapOrThrow(res);
}

export async function getApportionmentSnapshots(
  calculationType?: string
): Promise<ApportionmentSnapshotItem[]> {
  const url = buildListUrl("/apportionments/snapshots", calculationType ? { calculationType } : {});
  const res: ApiResult<ApportionmentSnapshotItem[]> = await get(url);
  return unwrapOrThrow(res);
}

export async function getApportionmentSnapshotById(
  id: number
): Promise<ApportionmentSnapshotDetail> {
  const res: ApiResult<ApportionmentSnapshotDetail> = await get(`/apportionments/snapshots/${id}`);
  return unwrapOrThrow(res);
}

export async function triggerApportionmentSnapshot(): Promise<any> {
  const res: ApiResult<any> = await post("/apportionments/snapshots/trigger", {});
  return unwrapOrThrow(res);
}
