import DashboardLayout from "../components/layout/DashboardLayout";
import Home from "./Home";
function Dashboard({ children }) {

  return (
    <>
      <DashboardLayout fullWidth={!children}>
        {children || <Home />}
      </DashboardLayout>
    </>
  );
}

export default Dashboard;
