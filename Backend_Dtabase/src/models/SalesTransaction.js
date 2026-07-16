class SalesTransaction {
  constructor(id, customerId, totalAmount, status) {
    this.id = id;
    this.customerId = customerId;
    this.totalAmount = totalAmount;
    this.status = status;
  }
}

module.exports = SalesTransaction;
