import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../services/api";
import type { User } from "../../../types";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

const UserListPage = () => {
  const { user } = useAuth() as { user: AuthUser | null };
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-list-page">
      <div className="page-header">
        <h1>User Management</h1>
        {user?.role === "admin" && <button className="btn-primary">Add User</button>}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td>{new Date(u.createdAt || "").toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-secondary btn-sm">Edit</button>
                      {user?.role === "admin" && u.id !== user?.id && (
                        <button className="btn-danger btn-sm">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;