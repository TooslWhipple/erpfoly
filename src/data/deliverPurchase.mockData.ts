function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function markClientPurchaseAsDelivered(_purchaseId: string): Promise<void> {
  await delay(600);
}
