import { useEffect, useState } from "react";
import api from "../api";

function Inventory() {

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchInventory = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await api.get("/api/inventory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setInventory(response.data);

      } catch (error) {

        console.error("Inventory API Error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchInventory();

  }, []);

  if (loading) {
    return <h2>Loading Inventory...</h2>;
  }

  return (
    <div className="panel">

      <h1>Inventory</h1>

      <table>

        <thead>

          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Stock</th>
          </tr>

        </thead>

        <tbody>

          {inventory.map((item) => (

            <tr key={item.inventory_id}>

              <td>{item.inventory_id}</td>
              <td>{item.product_name}</td>
              <td>{item.stock_quantity}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );

}

export default Inventory;