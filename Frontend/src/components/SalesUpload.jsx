import { useState } from "react";
import api from "../api";

function SalesUpload() {
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const requiredFields = [
    "customer_id",
    "product_id",
    "quantity",
    "payment_method",
    "payment_status"
  ];

  const handleFileUpload = (file) => {
    if (!file) return;

    setFileName(file.name);
    setSelectedFile(file);
    setErrors([]);
    setPreviewData([]);

    if (!file.name.endsWith(".csv")) {
      setErrors(["Only CSV files are allowed."]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").filter((row) => row.trim() !== "");

      if (rows.length < 2) {
        setErrors(["CSV file must contain a header row and at least one data row."]);
        return;
      }

      const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
      const missingFields = requiredFields.filter((field) => !headers.includes(field));

      if (missingFields.length > 0) {
        setErrors([`Missing required fields: ${missingFields.join(", ")}`]);
        return;
      }

      try {
        const data = rows.slice(1, 6).map((row) => {
          const values = row.split(",");
          let obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : "";
          });
          return obj;
        });
        setPreviewData(data);
      } catch (err) {
        setErrors(["Failed to generate preview rows from CSV."]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      handleFileUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const uploadSalesCSV = async () => {
    if (!selectedFile) {
      alert("Please choose a CSV file first.");
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/api/upload/sales", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(
        `Sales CSV uploaded successfully!\nInserted rows: ${response.data.inserted}\nFailed/Duplicate rows: ${response.data.failed}`
      );
      setSelectedFile(null);
      setFileName("");
      setPreviewData([]);
    } catch (error) {
      alert(error.formattedMessage || "CSV Upload Failed. Ensure categories/products/inventory are configured.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="panel">
      <h1>📥 Sales Transactions Batch Ingestion</h1>
      <p className="page-desc">
        Ingest batch sales transaction logs in CSV format. The ingestion will auto-validate, decrement inventory counts, and log transactions.
      </p>

      <div className="card" style={{ padding: "30px" }}>
        <div
          className="upload-box"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: "2px dashed #38bdf8",
            background: "#020617",
            borderRadius: "12px",
            padding: "40px 20px",
            cursor: "pointer",
            textAlign: "center"
          }}
        >
          <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>📁</span>
          <p style={{ margin: "0 0 16px", color: "#94a3b8" }}>Drag and drop your sales CSV file here or</p>
          <label className="file-btn" style={{ background: "#38bdf8", color: "#020617", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Browse Computer
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {fileName && (
          <div style={{ marginTop: "20px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020617", padding: "12px 18px", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#38bdf8", fontWeight: "bold" }}>Selected File: {fileName}</span>
            <button
              onClick={uploadSalesCSV}
              disabled={uploading || errors.length > 0}
              style={{ padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
            >
              {uploading ? "Uploading..." : "Commit Batch"}
            </button>
          </div>
        )}

        {errors.length > 0 && (
          <div className="error-box" style={{ marginTop: "20px", textAlign: "left" }}>
            <h3 style={{ margin: "0 0 10px", color: "#fecaca" }}>CSV Formatting Errors</h3>
            {errors.map((error, idx) => (
              <p key={idx} style={{ margin: "4px 0", fontSize: "14px" }}>• {error}</p>
            ))}
          </div>
        )}

        {previewData.length > 0 && (
          <div className="preview-box" style={{ marginTop: "30px", textAlign: "left" }}>
            <h3 style={{ color: "#38bdf8", marginBottom: "12px" }}>Ingestion Preview (First 5 Rows)</h3>
            <table>
              <thead>
                <tr>
                  {requiredFields.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index}>
                    {requiredFields.map((field) => (
                      <td key={field}>{row[field]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesUpload;