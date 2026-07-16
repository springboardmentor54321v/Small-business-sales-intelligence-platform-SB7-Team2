import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ForecastReports() {

  const data = {

    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ],

    datasets: [

      {

        label: "Predicted Sales",

        data: [
          120,
          150,
          170,
          165,
          210,
          240,
          280,
        ],

        borderColor: "#38bdf8",

        backgroundColor: "#38bdf8",

        tension: 0.4,

      },

    ],

  };

  const options = {

    responsive: true,

    plugins: {

      legend: {
        position: "top",
      },

      title: {

        display: true,

        text: "Sales Forecast",

      },

    },

  };

  return (

    <div className="panel">

      <h1>Forecast Reports</h1>

      <p>
        Predicted future sales using sample data.
      </p>
      <div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  }}
>

  <div className="card">
    <h2>₹280K</h2>
    <p>Expected Revenue</p>
  </div>

  <div className="card">
    <h2>+18%</h2>
    <p>Growth Rate</p>
  </div>

  <div className="card">
    <h2>95%</h2>
    <p>Forecast Accuracy</p>
  </div>

</div>

      <div
        className="card"
        style={{
          marginTop: "30px",
        }}
      >

        <Line
          data={data}
          options={options}
        />

      </div>

    </div>

  );

}

export default ForecastReports;