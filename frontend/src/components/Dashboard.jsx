import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";
import "./Dashboard.css";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);


function Dashboard() {


  const salesTrend = {

    labels:[
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],

    datasets:[

      {
        label:"Daily Sales",

        data:[
          1200,
          1800,
          900,
          2500,
          2000,
          3200,
          2800
        ],

        borderColor:"#38bdf8",

        backgroundColor:"#38bdf8",

        pointBackgroundColor:"#ffffff",

        pointBorderColor:"#38bdf8",

        borderWidth:3,

        tension:0.4

      }

    ]

  };



  const products = {

    labels:[
      "Rice",
      "Oil",
      "Sugar",
      "Snacks"
    ],


    datasets:[

      {

        label:"Top Products",

        data:[
          45,
          30,
          20,
          15
        ],


        backgroundColor:[
          "#38bdf8",
          "#22c55e",
          "#facc15",
          "#f97316"
        ],


        borderColor:"#ffffff",

        borderWidth:2

      }

    ]

  };



  const chartOptions={

    plugins:{

      legend:{

        labels:{

          color:"#ffffff"

        }

      }

    },


    scales:{

      x:{

        ticks:{
          color:"#ffffff"
        },

        grid:{
          color:"#334155"
        }

      },


      y:{

        ticks:{
          color:"#ffffff"
        },

        grid:{
          color:"#334155"
        }

      }

    }

  };



  return(

    <div className="dashboard">


      <h1>
        Sales Dashboard
      </h1>



      <div className="cards">


        <div className="card">

          <h3>
            Total Revenue
          </h3>

          <h2>
            ₹1,25,000
          </h2>

          <p>
            Monthly Revenue
          </p>

        </div>



        <div className="card">

          <h3>
            Total Sales
          </h3>

          <h2>
            320
          </h2>

          <p>
            Transactions
          </p>

        </div>



        <div className="card">

          <h3>
            Top Product
          </h3>

          <h2>
            Rice
          </h2>

          <p>
            Best selling item
          </p>

        </div>


      </div>




      <div className="charts">


        <div className="chart-box">

          <h2>
            Daily Sales Trend
          </h2>


          <Line
            data={salesTrend}
            options={chartOptions}
          />

        </div>




        <div className="chart-box">

          <h2>
            Top Products
          </h2>


          <Pie
            data={products}
            options={chartOptions}
          />


        </div>


      </div>



    </div>

  );


}


export default Dashboard;
