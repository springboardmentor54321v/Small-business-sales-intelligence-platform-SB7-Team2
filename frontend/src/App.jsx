import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import api from "./api";
import axios from "axios";
import { useState, useEffect } from "react";
import "./App.css";


const roleMenus = {
  Admin: [
    "Dashboard",
    "Users",
    "Reports",
    "Settings",
    "Logout",
  ],

  Manager: [
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
};


function App() {

const [isLoggedIn, setIsLoggedIn] = useState(false);
useEffect(() => {

  const token = localStorage.getItem("token");

  if (token) {
    setIsLoggedIn(true);
  }

}, []);
const [showRegister, setShowRegister] = useState(false);

const [role, setRole] = useState("Admin");
const [activePage, setActivePage] = useState("Dashboard");

const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");

const [fileName, setFileName] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
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
    setSelectedFile(file);
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

  const uploadSalesCSV = async () => {

  if (!selectedFile) {
    alert("Please choose a CSV file first.");
    return;
  }

  try {

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await api.post(
      "/api/upload/sales",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(response.data.message || "Sales CSV uploaded successfully.");
    setSelectedFile(null);
    setFileName("");
    setPreviewData([]);

  } catch (error) {

    alert(
      error.response?.data?.message || "CSV Upload Failed"
    );

  }

};

const roleMap = {
  Admin: 1,
  Manager: 2,
  "Sales Executive": 3,
};
const handleLogin = async () => {

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {

    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);

    alert("Login Successful");

    setIsLoggedIn(true);

  } catch (error) {

    console.log(error.response?.data);
console.log(error.response);

alert(
  JSON.stringify(error.response?.data) || "Login Failed"
);

  }

};
const registerUser = async () => {

  try {

    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        full_name: fullName,
        email: email,
        password: password,
        phone: phone,
        role_id: roleMap[role],
      }
    );

    alert(response.data.message || "Registration Successful");

    setShowRegister(false);

    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");

  } catch (error) {

    alert(
      error.response?.data?.message ||
      "Registration Failed"
    );

  }

};


  if (!isLoggedIn) {

  if (!showRegister) {

    return (

      <div className="login-page">

        <div className="login-card">

          <h1>MarketMind AI</h1>

          <p>Small Business Sales Intelligence Platform</p>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Admin</option>
            <option>Manager</option>
            <option>Sales Executive</option>
          </select>

          <button onClick={handleLogin}>
  Login
</button>

          <button
            className="secondary-btn"
            onClick={() => setShowRegister(true)}
          >
            Get Started
          </button>

        </div>

      </div>

    );

  }

return (

  <div className="login-page">

    <div className="login-card">

      <h1>MarketMind AI</h1>

      <p>Create Your Account</p>

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option>Admin</option>
        <option>Manager</option>
        <option>Sales Executive</option>
      </select>

      <button onClick={registerUser}>
        Get Started
      </button>

      <button
        className="secondary-btn"
        onClick={() => setShowRegister(false)}
      >
        Back to Login
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

                if (item === "Logout") {

                    localStorage.removeItem("token");

                    setIsLoggedIn(false);

                    setActivePage("Dashboard");

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
  activePage === "Inventory" && (

    <Inventory />

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
  fileName && (
    <>
      <p>
        Selected file: {fileName}
      </p>

      <button
        onClick={uploadSalesCSV}
        style={{
          marginTop: "15px",
          width: "100%",
        }}
      >
        Upload CSV
      </button>
    </>
  )
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