import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-navy-900">
                <Outlet /> {/* Render the matched child route component here */}
        </div>
    )
}

export default AuthLayout;