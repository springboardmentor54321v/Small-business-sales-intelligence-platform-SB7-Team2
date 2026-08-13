import { useState, useEffect } from "react";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  UsersRound,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Database,
  FileBarChart,
  LoaderCircle,
} from "lucide-react";
import api from "../api";
import "./ForecastReports.css";

function ForecastReports() {
  const [activeReportTab, setActiveReportTab] =
    useState("sales");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [salesReport, setSalesReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [customersReport, setCustomersReport] =
    useState([]);
  const [revenueReport, setRevenueReport] =
    useState(null);

  const fetchReports = async (isRefresh = false) => {
  if (isRefresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  setError(null);

  try {
    const [
      salesRes,
      invRes,
      custRes,
      revRes,
    ] = await Promise.all([
      api.get("/api/reports/sales"),
      api.get("/api/reports/inventory"),
      api.get("/api/reports/customers"),
      api.get("/api/reports/revenue"),
    ]);

    console.log("REPORT SALES RESPONSE:", salesRes.data);
    console.log("REPORT INVENTORY RESPONSE:", invRes.data);
    console.log("REPORT CUSTOMERS RESPONSE:", custRes.data);
    console.log("REPORT REVENUE RESPONSE:", revRes.data);

    setSalesReport(
  salesRes.data.data || []
);

setInventoryReport(
  invRes.data.data || []
);

setCustomersReport(
  custRes.data.data || []
);

setRevenueReport(
  revRes.data.summary || null
);

  } catch (err) {
    console.error("REPORT API ERROR:", err);
    console.error("STATUS:", err.response?.status);
    console.error("DATA:", err.response?.data);

    setError(
      err.response?.data?.message ||
      err.formattedMessage ||
      "Failed to load business report analytics."
    );

    setSalesReport([]);
    setInventoryReport([]);
    setCustomersReport([]);
    setRevenueReport(null);

  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="reports-loading">
        <LoaderCircle
          size={28}
          className="reports-spinner"
        />

        <span>
          Compiling business report analytics...
        </span>
      </div>
    );
  }

  const paidSales = salesReport.filter(
    (sale) =>
      sale.payment_status === "Paid"
  ).length;

  const pendingSales =
    salesReport.length - paidSales;

  const lowStockItems =
    inventoryReport.filter(
      (item) =>
        Number(item.stock_quantity) <=
        Number(item.reorder_level)
    ).length;

  const totalStockUnits =
    inventoryReport.reduce(
      (sum, item) =>
        sum +
        Number(item.stock_quantity || 0),
      0
    );

  const reportTabs = [
    {
      id: "sales",
      label: "Sales Ledger",
      icon: BarChart3,
      count: salesReport.length,
    },
    {
      id: "inventory",
      label: "Inventory Audits",
      icon: Boxes,
      count: inventoryReport.length,
    },
    {
      id: "revenue",
      label: "Revenue Analytics",
      icon: CircleDollarSign,
      count: revenueReport ? 1 : 0,
    },
    {
      id: "customers",
      label: "Client Directory",
      icon: UsersRound,
      count: customersReport.length,
    },
  ];

  return (
    <div className="reports-page">

      {/* HEADER */}

      <section className="reports-header">

        <div>
          <span className="reports-eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h1>Analytics & Reports</h1>

          <p>
            Review sales activity, inventory health,
            revenue performance and customer records
            from the business database.
          </p>
        </div>

        <button
          type="button"
          className="reports-refresh-button"
          onClick={() => fetchReports(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "reports-spinner"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Reports"}
        </button>

      </section>

      {/* OVERVIEW CARDS */}

      <section className="reports-overview-grid">

        <div className="reports-overview-card">

          <div className="reports-overview-icon blue">
            <BarChart3 size={19} />
          </div>

          <div>
            <span>Total Sales Records</span>

            <strong>
              {salesReport.length}
            </strong>

            <small>
              {paidSales} successfully paid
            </small>
          </div>

        </div>

        <div className="reports-overview-card">

          <div className="reports-overview-icon green">
            <Boxes size={19} />
          </div>

          <div>
            <span>Stock Units</span>

            <strong>
              {totalStockUnits.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              {inventoryReport.length} products
              tracked
            </small>
          </div>

        </div>

        <div className="reports-overview-card">

          <div className="reports-overview-icon amber">
            <AlertTriangle size={19} />
          </div>

          <div>
            <span>Low Stock Items</span>

            <strong>
              {lowStockItems}
            </strong>

            <small>
              Require inventory attention
            </small>
          </div>

        </div>

        <div className="reports-overview-card">

          <div className="reports-overview-icon purple">
            <UsersRound size={19} />
          </div>

          <div>
            <span>Customer Records</span>

            <strong>
              {customersReport.length}
            </strong>

            <small>
              Registered customers
            </small>
          </div>

        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="reports-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* REPORT WORKSPACE */}

      <section className="reports-workspace">

        <div className="reports-workspace-header">

          <div>
            <span className="reports-section-label">
              REPORT CENTER
            </span>

            <h2>Business Reports</h2>

            <p>
              Select a report category to inspect
              detailed records.
            </p>
          </div>

          <div className="reports-source">
            <Database size={13} />
            PostgreSQL Data
          </div>

        </div>

        {/* TABS */}

        <div className="reports-tabs">

          {reportTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={
                  activeReportTab === tab.id
                    ? "reports-tab active"
                    : "reports-tab"
                }
                onClick={() =>
                  setActiveReportTab(tab.id)
                }
              >
                <Icon size={15} />

                <span>{tab.label}</span>

                <small>{tab.count}</small>
              </button>
            );
          })}

        </div>

        {/* CONTENT */}

        <div className="reports-content">

          {/* SALES */}

          {activeReportTab === "sales" && (
            <div className="report-panel">

              <div className="report-panel-header">

                <div>
                  <span>
                    TRANSACTION AUDIT
                  </span>

                  <h3>Sales Ledger</h3>

                  <p>
                    Complete record of recorded
                    sales transactions.
                  </p>
                </div>

                <div className="report-record-count">
                  {salesReport.length} RECORDS
                </div>

              </div>

              {salesReport.length > 0 ? (
                <div className="reports-table-wrapper">

                  <table className="reports-table">

                    <thead>
                      <tr>
                        <th>Sale ID</th>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Sale Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {salesReport.map((sale) => (
                        <tr key={sale.sale_id}>

                          <td>
                            <span className="record-id">
                              #{sale.sale_id}
                            </span>
                          </td>

                          <td>
                            <strong className="invoice-reference">
                              {sale.invoice_no}
                            </strong>
                          </td>

                          <td>
                            {sale.customer_name}
                          </td>

                          <td>
                            <span className="method-label">
                              {sale.payment_method}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                sale.payment_status ===
                                "Paid"
                                  ? "report-status paid"
                                  : "report-status pending"
                              }
                            >
                              {sale.payment_status ===
                              "Paid" ? (
                                <CheckCircle2
                                  size={12}
                                />
                              ) : (
                                <AlertTriangle
                                  size={12}
                                />
                              )}

                              {sale.payment_status}
                            </span>
                          </td>

                          <td>
                            <strong>
                              ₹
                              {Number(
                                sale.total_amount || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </td>

                          <td>
                            <span className="report-date">
                              <CalendarDays
                                size={12}
                              />
                              {sale.sale_date}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              ) : (
                <EmptyReport
                  message="No sales transactions found."
                />
              )}

            </div>
          )}

          {/* INVENTORY */}

          {activeReportTab === "inventory" && (
            <div className="report-panel">

              <div className="report-panel-header">

                <div>
                  <span>
                    INVENTORY AUDIT
                  </span>

                  <h3>Warehouse Stock</h3>

                  <p>
                    Current stock availability and
                    reorder thresholds.
                  </p>
                </div>

                <div className="report-record-count">
                  {inventoryReport.length} ITEMS
                </div>

              </div>

              {inventoryReport.length > 0 ? (
                <div className="reports-table-wrapper">

                  <table className="reports-table">

                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product</th>
                        <th>Warehouse</th>
                        <th>Available</th>
                        <th>Threshold</th>
                        <th>Stock Health</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>

                    <tbody>
                      {inventoryReport.map(
                        (item) => {
                          const isLow =
                            Number(
                              item.stock_quantity
                            ) <=
                            Number(
                              item.reorder_level
                            );

                          return (
                            <tr
                              key={
                                item.inventory_id
                              }
                            >

                              <td>
                                <span className="record-id">
                                  SKU-
                                  {String(
                                    item.inventory_id
                                  ).padStart(
                                    5,
                                    "0"
                                  )}
                                </span>
                              </td>

                              <td>
                                <strong>
                                  {
                                    item.product_name
                                  }
                                </strong>
                              </td>

                              <td>
                                {item.warehouse_location ||
                                  "Awaiting placement"}
                              </td>

                              <td>
                                <strong
                                  className={
                                    isLow
                                      ? "stock-low"
                                      : "stock-good"
                                  }
                                >
                                  {
                                    item.stock_quantity
                                  }{" "}
                                  units
                                </strong>
                              </td>

                              <td>
                                {
                                  item.reorder_level
                                }{" "}
                                units
                              </td>

                              <td>
                                <span
                                  className={
                                    isLow
                                      ? "stock-health low"
                                      : "stock-health good"
                                  }
                                >
                                  <span />

                                  {isLow
                                    ? "REORDER"
                                    : "HEALTHY"}
                                </span>
                              </td>

                              <td>
                                <span className="report-date">
                                  <CalendarDays
                                    size={12}
                                  />

                                  {
                                    item.last_updated
                                  }
                                </span>
                              </td>

                            </tr>
                          );
                        }
                      )}
                    </tbody>

                  </table>

                </div>
              ) : (
                <EmptyReport
                  message="No inventory records found."
                />
              )}

            </div>
          )}

          {/* REVENUE */}

          {activeReportTab === "revenue" && (
            <div className="report-panel">

              <div className="report-panel-header">

                <div>
                  <span>
                    FINANCIAL PERFORMANCE
                  </span>

                  <h3>Revenue Analytics</h3>

                  <p>
                    Aggregated revenue and
                    transaction-size statistics.
                  </p>
                </div>

                <div className="report-record-count">
                  LIVE DATA
                </div>

              </div>

              {revenueReport ? (
                <>

                  <div className="revenue-metrics">

                    <RevenueMetric
                      label="Total Revenue"
                      value={
                        revenueReport.totalRevenue
                      }
                      caption="Overall gross revenue"
                      primary
                    />

                    <RevenueMetric
                    label="Average Payment"
                    value={revenueReport.averagePayment}
                    caption="Mean payment value"
                    />

                    <RevenueMetric
                    label="Highest Payment"
                    value={revenueReport.highestPayment}
                    caption="Maximum recorded payment"
                    positive
                    />

                    <RevenueMetric
                    label="Lowest Payment"
                    value={revenueReport.lowestPayment}
                    caption="Minimum recorded payment"
                    />

                  </div>

                  <div className="revenue-spread">

                    <div className="spread-header">
                      <div>
                        <span>
                          TRANSACTION DISTRIBUTION
                        </span>

                        <h3>
                          Checkout Spread
                        </h3>
                      </div>

                      <FileBarChart
                        size={19}
                      />
                    </div>

                    <div className="spread-track">

                      <div className="spread-point">
                        <span>Minimum</span>

                        <strong>
                          ₹
                          {Number(
                            revenueReport.lowestPayment ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div className="spread-line">
                        <ArrowUpRight
                          size={16}
                        />
                      </div>

                      <div className="spread-point center">
                        <span>Average</span>

                        <strong>
                          ₹
                          {Math.round(
                            Number(
                              revenueReport.averagePayment||
                                0
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div className="spread-line">
                        <ArrowUpRight
                          size={16}
                        />
                      </div>

                      <div className="spread-point">
                        <span>Maximum</span>

                        <strong>
                          ₹
                          {Number(
                            revenueReport.highestPayment ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>

                </>
              ) : (
                <EmptyReport
                  message="Revenue analytics are not available."
                />
              )}

            </div>
          )}

          {/* CUSTOMERS */}

          {activeReportTab === "customers" && (
            <div className="report-panel">

              <div className="report-panel-header">

                <div>
                  <span>
                    CUSTOMER DATABASE
                  </span>

                  <h3>Client Directory</h3>

                  <p>
                    Registered customer records and
                    account information.
                  </p>
                </div>

                <div className="report-record-count">
                  {customersReport.length} CLIENTS
                </div>

              </div>

              {customersReport.length > 0 ? (
                <div className="reports-table-wrapper">

                  <table className="reports-table">

                    <thead>
                      <tr>
                        <th>Client ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Registered</th>
                      </tr>
                    </thead>

                    <tbody>
                      {customersReport.map(
                        (customer) => (
                          <tr
                            key={
                              customer.customer_id
                            }
                          >

                            <td>
                              <span className="record-id">
                                #
                                {
                                  customer.customer_id
                                }
                              </span>
                            </td>

                            <td>
                              <strong>
                                {
                                  customer.customer_name
                                }
                              </strong>
                            </td>

                            <td>
                              {customer.email ||
                                "N/A"}
                            </td>

                            <td>
                              {customer.phone ||
                                "N/A"}
                            </td>

                            <td className="address-cell">
                              {customer.address ||
                                "N/A"}
                            </td>

                            <td>
                              <span className="report-date">
                                <CalendarDays
                                  size={12}
                                />

                                {
                                  customer.created_at
                                }
                              </span>
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>
              ) : (
                <EmptyReport
                  message="No customer records found."
                />
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

function RevenueMetric({
  label,
  value,
  caption,
  primary,
  positive,
}) {
  return (
    <div
      className={
        primary
          ? "revenue-metric primary"
          : positive
          ? "revenue-metric positive"
          : "revenue-metric"
      }
    >
      <span>{label}</span>

      <strong>
        ₹
        {Number(value || 0).toLocaleString(
          "en-IN"
        )}
      </strong>

      <small>{caption}</small>
    </div>
  );
}

function EmptyReport({ message }) {
  return (
    <div className="report-empty">
      <div className="report-empty-icon">
        <Database size={22} />
      </div>

      <h3>No Data Available</h3>

      <p>{message}</p>
    </div>
  );
}

export default ForecastReports;