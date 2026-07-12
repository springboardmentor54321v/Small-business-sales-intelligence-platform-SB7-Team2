function SalesUpload({
  fileName,
  previewData,
  errors,
  requiredFields,
  handleFileUpload,
  handleDrop,
  handleDragOver,
}) {

  return (

    <section className="panel">

      <h1>Sales Data Upload</h1>

      <p>
        Upload CSV sales data for validation and preview.
      </p>

      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >

        <p>
          Drag and drop your sales CSV file here
        </p>

        <label className="file-btn">

          Choose CSV File

          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              handleFileUpload(e.target.files[0])
            }
          />

        </label>

      </div>

      {fileName && (
        <p>
          Selected file: {fileName}
        </p>
      )}

      {errors.length > 0 && (

        <div className="error-box">

          <h3>Validation Errors</h3>

          {errors.map((error) => (

            <p key={error}>
              {error}
            </p>

          ))}

        </div>

      )}

      {previewData.length > 0 && (

        <div className="preview-box">

          <h3>CSV Preview</h3>

          <table>

            <thead>

              <tr>

                {requiredFields.map((field) => (

                  <th key={field}>
                    {field}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {previewData.map((row, index) => (

                <tr key={index}>

                  {requiredFields.map((field) => (

                    <td key={field}>
                      {row[field]}
                    </td>

                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );

}

export default SalesUpload;