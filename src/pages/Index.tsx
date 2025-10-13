import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Productos from "@/components/Productos";
import Encargos from "@/components/Encargos";
import Empleados from "@/components/Empleados";
import Fichajes from "@/components/Fichajes";
import Incidencias from "@/components/Incidencias";
import Facturacion from "@/components/Facturacion";
import Configuracion from "@/components/Configuracion";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case "/productos":
        return <Productos />;
      case "/encargos":
        return <Encargos />;
      case "/empleados":
        return <Empleados />;
      case "/fichajes":
        return <Fichajes />;
      case "/incidencias":
        return <Incidencias />;
      case "/facturacion":
        return <Facturacion />;
      case "/configuracion":
        return <Configuracion />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
