function AnomalyAlerts() {

  const alerts = [

    {
      id:1,
      severity:"High",
      message:"Sales dropped by 40% today.",
    },

    {
      id:2,
      severity:"Medium",
      message:"Inventory running low for Laptop.",
    },

    {
      id:3,
      severity:"Low",
      message:"Unusual payment delay detected.",
    }

  ];

  const color = (severity)=>{

    switch(severity){

      case "High":
        return "#ef4444";

      case "Medium":
        return "#f59e0b";

      default:
        return "#3b82f6";

    }

  };

  return (

    <div className="panel">

      <h1>Anomaly Alerts</h1>

      <p>System generated warnings.</p>

      <div
        style={{
          marginTop:"30px",
          display:"flex",
          flexDirection:"column",
          gap:"20px",
        }}
      >

        {alerts.map(alert=>(

          <div

            key={alert.id}

            style={{
              background:color(alert.severity),
              color:"white",
              padding:"20px",
              borderRadius:"12px",
            }}

          >

            <h3>{alert.severity} Alert</h3>

            <p>{alert.message}</p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default AnomalyAlerts;