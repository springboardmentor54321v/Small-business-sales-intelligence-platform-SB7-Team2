import { useState, useEffect } from "react";
import api from "../api";

function UsersRolesCategories() {
  const [activeSubTab, setActiveSubTab] = useState("users");

  // Databases states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms states - Users
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ full_name: "", email: "", password: "", phone: "", role_id: "" });
  const [userModalOpen, setUserModalOpen] = useState(false);

  // Forms states - Roles
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ role_name: "", description: "" });
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Forms states - Categories
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ category_name: "", description: "" });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, roleRes, catRes] = await Promise.all([
        api.get("/api/users").catch(() => ({ data: { users: [] } })),
        api.get("/api/users/roles").catch(() => ({ data: { roles: [] } })),
        api.get("/api/categories").catch(() => ({ data: { categories: [] } }))
      ]);

      setUsers(userRes.data.users || []);
      setRoles(roleRes.data.roles || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // HANDLERS: USERS
  // ==========================================
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update User
        await api.put(`/api/users/${selectedUser.user_id}`, userForm);
        alert("User updated successfully!");
      } else {
        // Create User
        await api.post("/api/users", userForm);
        alert("User created successfully!");
      }
      setUserModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to save user details.");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/users/${userId}`);
      alert("User deleted successfully.");
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to delete user.");
    }
  };

  // ==========================================
  // HANDLERS: ROLES
  // ==========================================
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await api.put(`/api/users/roles/${selectedRole.role_id}`, roleForm);
        alert("Role updated successfully!");
      } else {
        await api.post("/api/users/roles", roleForm);
        alert("Role created successfully!");
      }
      setRoleModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to save role details.");
    }
  };

  const deleteRole = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await api.delete(`/api/users/roles/${roleId}`);
      alert("Role deleted successfully.");
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to delete role.");
    }
  };

  // ==========================================
  // HANDLERS: CATEGORIES
  // ==========================================
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await api.put(`/api/categories/${selectedCategory.category_id}`, categoryForm);
        alert("Category updated successfully!");
      } else {
        await api.post("/api/categories", categoryForm);
        alert("Category created successfully!");
      }
      setCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to save category details.");
    }
  };

  const deleteCategory = async (catId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/api/categories/${catId}`);
      alert("Category deleted successfully.");
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to delete category.");
    }
  };

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Synchronizing identity & directory structures...</p></div>;
  }

  return (
    <div className="panel">
      <h1>⚙️ Control Console</h1>
      <p className="page-desc">
        Admin settings workspace to audit operational profiles, manage role definitions, and configure retail categorizations.
      </p>

      {/* Tabs list */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>
        <button 
          onClick={() => setActiveSubTab("users")}
          style={{ padding: "10px 20px", background: activeSubTab === "users" ? "#38bdf8" : "transparent", color: activeSubTab === "users" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          👤 User Directory
        </button>
        <button 
          onClick={() => setActiveSubTab("roles")}
          style={{ padding: "10px 20px", background: activeSubTab === "roles" ? "#38bdf8" : "transparent", color: activeSubTab === "roles" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          🔑 Access Roles
        </button>
        <button 
          onClick={() => setActiveSubTab("categories")}
          style={{ padding: "10px 20px", background: activeSubTab === "categories" ? "#38bdf8" : "transparent", color: activeSubTab === "categories" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          🏷️ Product Categories
        </button>
      </div>

      {/* ==========================================
          SUBTAB: USERS
          ========================================== */}
      {activeSubTab === "users" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>User Operational Logins</h2>
            <button 
              onClick={() => {
                setSelectedUser(null);
                setUserForm({ full_name: "", email: "", password: "", phone: "", role_id: roles[0]?.role_id || "" });
                setUserModalOpen(true);
              }}
              style={{ padding: "10px 16px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              Add New User
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Role Mapping</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td style={{ fontWeight: "bold" }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "N/A"}</td>
                  <td>
                    <span style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "11px", background: "#1e3a8a", color: "white", fontWeight: "bold" }}>
                      {u.role_name}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => {
                          setSelectedUser(u);
                          setUserForm({ full_name: u.full_name, email: u.email, password: "", phone: u.phone || "", role_id: u.role_id });
                          setUserModalOpen(true);
                        }}
                        style={{ padding: "6px 10px", background: "#f59e0b", color: "#020617", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteUser(u.user_id)}
                        style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          SUBTAB: ROLES
          ========================================== */}
      {activeSubTab === "roles" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>System Access Privileges</h2>
            <button 
              onClick={() => {
                setSelectedRole(null);
                setRoleForm({ role_name: "", description: "" });
                setRoleModalOpen(true);
              }}
              style={{ padding: "10px 16px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              Add New Role
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Role ID</th>
                <th>Role Identity</th>
                <th>Description / Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.role_id}>
                  <td>{r.role_id}</td>
                  <td style={{ fontWeight: "bold", color: "#38bdf8" }}>{r.role_name}</td>
                  <td>{r.description || "No level limits defined."}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => {
                          setSelectedRole(r);
                          setRoleForm({ role_name: r.role_name, description: r.description || "" });
                          setRoleModalOpen(true);
                        }}
                        style={{ padding: "6px 10px", background: "#f59e0b", color: "#020617", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteRole(r.role_id)}
                        style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          SUBTAB: CATEGORIES
          ========================================== */}
      {activeSubTab === "categories" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>Catalog Category Groups</h2>
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setCategoryForm({ category_name: "", description: "" });
                setCategoryModalOpen(true);
              }}
              style={{ padding: "10px 16px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              Add Category
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Group Name</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.category_id}>
                  <td>{c.category_id}</td>
                  <td style={{ fontWeight: "bold", color: "#38bdf8" }}>{c.category_name}</td>
                  <td>{c.description || "No descriptions uploaded."}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => {
                          setSelectedCategory(c);
                          setCategoryForm({ category_name: c.category_name, description: c.description || "" });
                          setCategoryModalOpen(true);
                        }}
                        style={{ padding: "6px 10px", background: "#f59e0b", color: "#020617", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCategory(c.category_id)}
                        style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          USER DIALOG MODAL
          ========================================== */}
      {userModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleUserSubmit} className="card" style={{ width: "420px", display: "flex", flexDirection: "column", gap: "14px", textAlign: "left", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>{selectedUser ? "Modify User Directory" : "Create User Directory"}</h2>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Full Name</label>
              <input 
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Email Address</label>
              <input 
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Password {selectedUser && "(Leave blank to keep current)"}</label>
              <input 
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required={!selectedUser}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Phone Number</label>
              <input 
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>System Permission Level</label>
              <select 
                value={userForm.role_id}
                onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              >
                {roles.map(r => (
                  <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button type="submit" style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Save</button>
              <button type="button" onClick={() => setUserModalOpen(false)} style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          ROLE DIALOG MODAL
          ========================================== */}
      {roleModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleRoleSubmit} className="card" style={{ width: "400px", display: "flex", flexDirection: "column", gap: "14px", textAlign: "left", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>{selectedRole ? "Modify Role Level" : "Create Access Level"}</h2>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Role Name</label>
              <input 
                value={roleForm.role_name}
                onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Access Permissions Summary</label>
              <textarea 
                rows="3"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button type="submit" style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Save</button>
              <button type="button" onClick={() => setRoleModalOpen(false)} style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          CATEGORY DIALOG MODAL
          ========================================== */}
      {categoryModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleCategorySubmit} className="card" style={{ width: "400px", display: "flex", flexDirection: "column", gap: "14px", textAlign: "left", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>{selectedCategory ? "Modify Product Category" : "Create Product Category"}</h2>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Category Name</label>
              <input 
                value={categoryForm.category_name}
                onChange={(e) => setCategoryForm({ ...categoryForm, category_name: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "12px" }}>Description</label>
              <textarea 
                rows="3"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button type="submit" style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Save</button>
              <button type="button" onClick={() => setCategoryModalOpen(false)} style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UsersRolesCategories;
