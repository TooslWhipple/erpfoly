// ============================================================================
// INVENTORY TRANSFER TYPES
// ============================================================================

export interface TransferArticle {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive";
  department: string;
  line: string;
  inStock: number;
  inTransit: number;
}

export interface TransferArticleRow extends TransferArticle {
  transferQuantity: number;
}

export interface TransferArticleOption {
  id: string;
  code: string;
  name: string;
  inStock: number;
  inTransit: number;
}
