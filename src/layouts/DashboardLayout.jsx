import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import BASE_URL from '../config';
import Footer from '../components/Footer';
import FloatingButtons from "./floatingButton";
import admission from '../assets/payment.svg';
import enquiry from '../assets/reciept.svg';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const buttonsList = [
  { onClick: () => navigate('/admin/add-Lead'), label: "Enquiry" },
  { onClick: () => navigate('/admin/addNewAdd'), label: "Admission" },
  { onClick: () => navigate('/admin/addReciept'), label: "Receipt" },
  { onClick: () => navigate('/admin/addPayment'), label: "Payment" },
];


  return (
    <>
    <div className="flex min-h-screen">
      {/* Sidebar (hidden on mobile, toggleable) */}

      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex flex-1 min-h-0">
          <main className="flex-1 p-4 overflow-y-auto">
            <Outlet />
          </main>

          {/* Right Sidebar (hidden on small screens) */}
        </div>
      </div>
      <FloatingButtons buttonType="bars" buttonsList={buttonsList} direction="up" />
    </div>
    <Footer />
    </>
  );
}
