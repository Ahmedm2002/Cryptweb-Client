import DashboardLayout from "../components/layout/DashboardLayout";
import Home from "./Home";
function Dashboard({ children }) {

  return (
    <>
      <DashboardLayout>
        {children || <Home />}
      </DashboardLayout>
    </>
  );
}

export default Dashboard;
