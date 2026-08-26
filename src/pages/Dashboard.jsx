import DashboardLayout from "../components/layout/DashboardLayout";
import WhatsAppHome from "../components/whatsapp/WhatsAppHome";
function Dashboard({ children }) {

  return (
    <>
      <DashboardLayout>
        {children || <WhatsAppHome />}
      </DashboardLayout>
    </>
  );
}

export default Dashboard;
