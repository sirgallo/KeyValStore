export interface SimpleQueue {
  enqueue(insertValue: any): void;
  dequeue()
}

export interface SimpleStack {
  push();
  pop();
  peek();
}