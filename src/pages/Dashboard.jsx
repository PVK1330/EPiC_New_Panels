import { useSelector } from 'react-redux'

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-secondary mb-2">Dashboard</h1>
      <p className="text-gray-500">
        Welcome back{user?.name ? `, ${user.name}` : ''}!
      </p>
    </div>
  )
}

export default Dashboard
