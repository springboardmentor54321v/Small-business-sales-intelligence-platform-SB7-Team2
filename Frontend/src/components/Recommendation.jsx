import { useEffect, useState } from "react";
import axios from "axios";

function Recommendation() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendation();
  }, []);

  const fetchRecommendation = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/recommend-product/FUR-BO-10001798"
      );

      if (Array.isArray(res.data)) {
        setRecommendations(res.data);
      } else {
        setRecommendations([res.data]);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h1>Recommendation Engine</h1>

      <p>AI-powered product recommendations.</p>

      {loading ? (
        <p>Loading recommendations...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {recommendations.map((item, index) => (
            <div key={index} className="card">
              <h2>{item.product || item["Product"] || "Product"}</h2>

              <h3>⬇</h3>

              <h2>
                {item.recommendation ||
                  item["Recommended Product"] ||
                  item["Recommendation"] ||
                  "No Recommendation"}
              </h2>

              <p>
                Confidence Score
                <br />
                <strong>
                  {item.confidence ||
                    item["Confidence"] ||
                    item["confidence_score"] ||
                    "N/A"}
                </strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommendation;