import Dashboard from "./components/Dashboard";
import { useState } from "react";
import "./App.css";


const roleMenus = {
  "Business Owner": [
    "Dashboard",
    "Sales Upload",
    "Inventory",
    "Reports",
    "Forecast",
    "Logout",
  ],

  "Store Manager": [
    "Dashboard",
    "Sales Upload",
    "Inventory",
    "Reports",
    "Logout",
  ],

  "Sales Executive": [
    "Dashboard",
    "Sales Upload",
    "My Sales",
    "Logout",
  ],

  "System Administrator": [
    "Dashboard",
    "Users",
    "Roles",
    "Reports",
    "Settings",
    "Logout",
  ],
};


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("Business Owner");
  const [activePage, setActivePage] = useState("Dashboard");

  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);


  const requiredFields = [
    "invoice_no",
    "customer_id",
    "product_id",
    "quantity",
    "amount",
    "date"
  ];


  const handleFileUpload = (file) => {

    if (!file) return;


    setFileName(file.name);
    setErrors([]);
    setPreviewData([]);


    if (!file.name.endsWith(".csv")) {

      setErrors([
        "Only CSV files are allowed."
      ]);

      return;
    }


    const reader = new FileReader();


    reader.onload = (event)=>{

      const text = event.target.result;


      const rows = text
      .split("\n")
      .filter(row=>row.trim() !== "");



      if(rows.length < 2){

        setErrors([
          "CSV file must contain header and data."
        ]);

        return;
      }



      const headers = rows[0]
      .split(",")
      .map(h=>h.trim().toLowerCase());



      const missingFields = requiredFields.filter(
        field=>!headers.includes(field)
      );



      if(missingFields.length > 0){

        setErrors([
          `Missing required fields: ${missingFields.join(", ")}`
        ]);

        return;
      }



      const data = rows.slice(1,6).map(row=>{

        const values = row.split(",");

        let obj={};


        headers.forEach((header,index)=>{

          obj[header] =
          values[index]
          ? values[index].trim()
          : "";

        });


        return obj;

      });


      setPreviewData(data);


    };


    reader.readAsText(file);

  };



  const handleDrop=(event)=>{

    event.preventDefault();

    handleFileUpload(
      event.dataTransfer.files[0]
    );

  };



  const handleDragOver=(event)=>{

    event.preventDefault();

  };




  if(!isLoggedIn){

    return(

      <div className="login-page">

        <div className="login-card">

          <h1>
            MarketMind AI
          </h1>


          <p>
            Small Business Sales Intelligence Platform
          </p>



          <input
            placeholder="Enter email"
          />


          <input
            type="password"
            placeholder="Enter password"
          />



          <select
            value={role}
            onChange={
              e=>setRole(e.target.value)
            }
          >

            <option>
              Business Owner
            </option>

            <option>
              Store Manager
            </option>

            <option>
              Sales Executive
            </option>

            <option>
              System Administrator
            </option>


          </select>



          <button
            onClick={()=>
              setIsLoggedIn(true)
            }
          >
            Login
          </button>


        </div>

      </div>

    );

  }



  return(

    <div className="app">


      <aside className="sidebar">


        <h2>
          MarketMind AI
        </h2>


        <p>
          {role}
        </p>



        <nav>


        {
          roleMenus[role].map((item)=>(


            <a
              key={item}

              className={
                activePage===item
                ?"active"
                :""
              }


              onClick={()=>{

                if(item==="Logout"){

                  setIsLoggedIn(false);

                }

                else{

                  setActivePage(item);

                }

              }}

            >

              {item}

            </a>


          ))
        }


        </nav>


      </aside>




      <main className="main">


        {
          activePage==="Dashboard" && (

            <Dashboard />

          )
        }





        {
          activePage==="Sales Upload" && (

          <section className="panel">


            <h1>
              Sales Data Upload
            </h1>


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

                  onChange={
                    e=>handleFileUpload(
                      e.target.files[0]
                    )
                  }

                />


              </label>



            </div>



            {
              fileName &&

              <p>
                Selected file: {fileName}
              </p>

            }




            {
              errors.length>0 &&

              <div className="error-box">

                <h3>
                  Validation Errors
                </h3>


                {
                  errors.map(error=>(

                    <p key={error}>
                      {error}
                    </p>

                  ))
                }


              </div>

            }




            {
              previewData.length>0 &&

              <div className="preview-box">


                <h3>
                  CSV Preview
                </h3>



                <table>

                <thead>

                <tr>

                {
                  requiredFields.map(field=>(

                    <th key={field}>
                      {field}
                    </th>

                  ))
                }

                </tr>

                </thead>



                <tbody>


                {
                  previewData.map((row,index)=>(

                    <tr key={index}>


                    {
                      requiredFields.map(field=>(

                        <td key={field}>
                          {row[field]}
                        </td>

                      ))
                    }


                    </tr>


                  ))
                }


                </tbody>


                </table>


              </div>

            }



          </section>

          )
        }



      </main>


    </div>

  );

}


export default App;