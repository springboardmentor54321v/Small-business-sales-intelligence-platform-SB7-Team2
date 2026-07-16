class SalesItem {
  constructor(id, transactionId, productId, quantity, price) {
    this.id = id;
    this.transactionId = transactionId;
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }
}

module.exports = SalesItem;
