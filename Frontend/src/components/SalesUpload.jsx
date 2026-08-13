import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Database,
  X,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import api from "../api";
import "./SalesUpload.css";

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
    "payment_status",
  ];

  const handleFileUpload = (file) => {
    if (!file) return;

    setFileName(file.name);
    setSelectedFile(file);
    setErrors([]);
    setPreviewData([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrors(["Only CSV files are allowed."]);
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const rows = text
        .split("\n")
        .filter((row) => row.trim() !== "");

      if (rows.length < 2) {
        setErrors([
          "CSV file must contain a header row and at least one data row.",
        ]);
        return;
      }

      const headers = rows[0]
        .split(",")
        .map((h) => h.trim().toLowerCase());

      const missingFields = requiredFields.filter(
        (field) => !headers.includes(field)
      );

      if (missingFields.length > 0) {
        setErrors([
          `Missing required fields: ${missingFields.join(", ")}`,
        ]);
        return;
      }

      try {
        const data = rows.slice(1, 6).map((row) => {
          const values = row.split(",");
          const obj = {};

          headers.forEach((header, index) => {
            obj[header] = values[index]
              ? values[index].trim()
              : "";
          });

          return obj;
        });

        setPreviewData(data);
      } catch (err) {
        setErrors([
          "Failed to generate preview rows from CSV.",
        ]);
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

  const clearFile = () => {
    setFileName("");
    setSelectedFile(null);
    setPreviewData([]);
    setErrors([]);
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

      const response = await api.post(
        "/api/upload/sales",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(
        `Sales CSV uploaded successfully!\nInserted rows: ${response.data.inserted}\nFailed/Duplicate rows: ${response.data.failed}`
      );

      clearFile();
    } catch (error) {
      alert(
        error.formattedMessage ||
          "CSV Upload Failed. Ensure categories/products/inventory are configured."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sales-upload-page">
      {/* HEADER */}
      <section className="sales-upload-header">
        <div>
          <span className="sales-upload-eyebrow">
            DATA OPERATIONS
          </span>

          <h1>Sales Data Upload</h1>

          <p>
            Import batch sales transactions securely through
            CSV ingestion. The platform validates the file,
            previews the data and updates transaction records.
          </p>
        </div>

        <div className="upload-status-badge">
          <span className="status-dot" />
          CSV INGESTION READY
        </div>
      </section>

      {/* PROCESS OVERVIEW */}
      <section className="upload-process">
        <div className="process-step active">
          <div className="process-number">01</div>

          <div>
            <strong>Select File</strong>
            <span>Choose your CSV dataset</span>
          </div>
        </div>

        <div className="process-line" />

        <div
          className={`process-step ${
            previewData.length > 0 ? "active" : ""
          }`}
        >
          <div className="process-number">02</div>

          <div>
            <strong>Validate & Preview</strong>
            <span>Review the first five rows</span>
          </div>
        </div>

        <div className="process-line" />

        <div className="process-step">
          <div className="process-number">03</div>

          <div>
            <strong>Commit Batch</strong>
            <span>Insert transactions</span>
          </div>
        </div>
      </section>

      {/* UPLOAD PANEL */}
      <section className="sales-upload-panel">
        <div className="upload-panel-header">
          <div>
            <span className="sales-section-label">
              TRANSACTION INGESTION
            </span>

            <h2>Upload Sales Dataset</h2>

            <p>
              Accepted format: CSV. Required transaction fields
              are validated before ingestion.
            </p>
          </div>

          <div className="upload-file-icon">
            <FileSpreadsheet size={22} />
          </div>
        </div>

        {/* DROP ZONE */}
        <div
          className={`sales-drop-zone ${
            selectedFile ? "has-file" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="drop-icon">
            {selectedFile ? (
              <FileSpreadsheet size={30} />
            ) : (
              <UploadCloud size={30} />
            )}
          </div>

          {selectedFile ? (
            <>
              <h3>{fileName}</h3>

              <p>
                File selected and ready for validation.
              </p>

              <button
                type="button"
                className="change-file-button"
                onClick={clearFile}
              >
                <X size={14} />
                Remove File
              </button>
            </>
          ) : (
            <>
              <h3>Drop your sales CSV here</h3>

              <p>
                Drag and drop your dataset or browse your
                computer.
              </p>

              <label className="browse-file-button">
                <Upload size={16} />
                Browse Computer

                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    handleFileUpload(e.target.files[0])
                  }
                />
              </label>

              <span className="file-hint">
                CSV files only
              </span>
            </>
          )}
        </div>

        {/* VALIDATION ERROR */}
        {errors.length > 0 && (
          <div className="sales-error-box">
            <div className="sales-error-icon">
              <AlertTriangle size={18} />
            </div>

            <div>
              <strong>CSV Validation Failed</strong>

              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          </div>
        )}

        {/* FILE READY */}
        {selectedFile && errors.length === 0 && (
          <div className="selected-file-bar">
            <div className="selected-file-info">
              <div className="selected-file-icon">
                <FileSpreadsheet size={18} />
              </div>

              <div>
                <strong>{fileName}</strong>

                <span>
                  {previewData.length > 0
                    ? "Validation successful"
                    : "Processing file..."}
                </span>
              </div>
            </div>

            <div className="file-ready">
              <CheckCircle2 size={15} />
              Ready
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {previewData.length > 0 && (
          <div className="sales-preview">
            <div className="preview-header">
              <div>
                <span className="sales-section-label">
                  DATA VALIDATION
                </span>

                <h3>Ingestion Preview</h3>

                <p>
                  Showing the first {previewData.length} rows
                  from your selected dataset.
                </p>
              </div>

              <div className="preview-valid">
                <CheckCircle2 size={15} />
                Valid structure
              </div>
            </div>

            <div className="sales-table-wrapper">
              <table className="sales-preview-table">
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
                        <td key={field}>
                          {row[field] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMMIT */}
        {selectedFile &&
          errors.length === 0 &&
          previewData.length > 0 && (
            <div className="commit-section">
              <div className="commit-info">
                <Database size={20} />

                <div>
                  <strong>Ready to commit batch</strong>

                  <span>
                    This will send the validated CSV to the
                    sales transaction service.
                  </span>
                </div>
              </div>

              <button
                className="commit-button"
                onClick={uploadSalesCSV}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="upload-spin"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Commit Batch
                  </>
                )}
              </button>
            </div>
          )}
      </section>

      {/* REQUIRED FIELDS */}
      <section className="required-fields-panel">
        <div>
          <span className="sales-section-label">
            DATA CONTRACT
          </span>

          <h2>Required CSV Fields</h2>

          <p>
            Your dataset must contain the following columns
            before it can be processed.
          </p>
        </div>

        <div className="required-fields-list">
          {requiredFields.map((field) => (
            <span key={field}>{field}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SalesUpload;