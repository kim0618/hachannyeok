export class StorageMutationCoordinator {
  private chain: Promise<void> = Promise.resolve();

  enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.chain.then(operation);
    this.chain = result.then(() => undefined, () => undefined);
    return result;
  }
}
