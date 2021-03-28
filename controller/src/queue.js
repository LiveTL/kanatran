/**
 * @template T
 */
class Queue {
  constructor() {
    this.clear();
    this.length = 0;
  }
  
  clear() {
    this.top = null;
    this.last = this.top;
    this.length = 0;
  }
  
  /**
     * @returns {T}
     */
  pop() {
    const front = this.top;
    this.top = this.top.next;
    if (front === this.last) {
      this.last = null;
    }
    this.length--;
    return front;
  }
  
  /**
     * @param {T} item 
     */
  push(item) {
    const newItem = { data: item };
    if (this.last === null) {
      this.top = newItem;
      this.last = this.top;
    } else {
      this.last.next = newItem;
      this.last = newItem;
    }
    this.length++;
  }
}

module.exports = {
  Queue
};