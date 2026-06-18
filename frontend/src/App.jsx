import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Packages from './pages/Packages'
import Appointments from './pages/Appointments'
import Reports from './pages/Reports'
import SidebarLayout from './components/SidebarLayout'

function App() {
    return (
        <ConfigProvider locale={zhCN}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <SidebarLayout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/packages" element={<Packages />} />
                                <Route path="/appointments" element={<Appointments />} />
                                <Route path="/reports" element={<Reports />} />
                            </Routes>
                        </SidebarLayout>
                    } />
                </Routes>
            </Router>
        </ConfigProvider>
    )
}

export default App
