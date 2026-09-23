import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  return (
<div className="dashboard">
  <div className="page-content-wrapper">
    <h1>Welcome, {user?.name}! 👋</h1>
    <p>Role: {user?.role}</p>
    <p>Email: {user?.email}</p>
  </div>
</div>
  );
};

export default Dashboard;