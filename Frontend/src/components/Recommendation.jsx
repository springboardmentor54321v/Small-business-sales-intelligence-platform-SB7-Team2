function Recommendation() {

  const recommendations = [

    {
      id: 1,
      product: "Laptop",
      recommendation: "Wireless Mouse",
      confidence: "95%",
    },

    {
      id: 2,
      product: "Keyboard",
      recommendation: "Mouse Pad",
      confidence: "89%",
    },

    {
      id: 3,
      product: "Printer",
      recommendation: "A4 Paper Pack",
      confidence: "91%",
    },

    {
      id: 4,
      product: "Monitor",
      recommendation: "HDMI Cable",
      confidence: "93%",
    }

  ];

  return (

    <div className="panel">

      <h1>Recommendation Engine</h1>

      <p>
        Products frequently purchased together.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >

        {recommendations.map((item) => (

          <div
            key={item.id}
            className="card"
          >

            <h2>{item.product}</h2>

            <h3>⬇</h3>

            <h2>{item.recommendation}</h2>

            <p>

              Confidence Score

              <br />

              <strong>{item.confidence}</strong>

            </p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Recommendation;