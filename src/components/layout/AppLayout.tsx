import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"


const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-navy-900">
      {/* Sidebar — left side */}
      <Sidebar />

      {/* Right side — topbar + content */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* Render the matched child route component here */}
        </main>
      </div>
    </div>
  )
}

export default AppLayout