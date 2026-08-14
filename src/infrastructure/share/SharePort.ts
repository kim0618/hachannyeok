export interface SharePort {
  open(message: string): Promise<void>;
}
