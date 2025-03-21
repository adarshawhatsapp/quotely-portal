
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText, AlertTriangle } from "lucide-react";

const AdminDashboardPage = () => {
  // Mock data for the dashboard
  const stats = [
    {
      title: "Total Users",
      value: "24",
      description: "7 new in the last 30 days",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Products",
      value: "156",
      description: "12 added this month",
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Quotations",
      value: "89",
      description: "32 generated this month",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Approvals",
      value: "5",
      description: "User accounts awaiting approval",
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      action: "New user registered",
      user: "John Smith",
      time: "2 hours ago",
    },
    {
      action: "Product added",
      user: "Admin",
      time: "5 hours ago",
    },
    {
      action: "Quotation approved",
      user: "Sales Manager",
      time: "Yesterday",
    },
    {
      action: "Price updated for 12 products",
      user: "Admin",
      time: "2 days ago",
    },
    {
      action: "New user registered",
      user: "Sarah Johnson",
      time: "3 days ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden hover-lift">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start pb-4 last:pb-0 last:border-0 border-b">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Overview of system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Server Uptime</span>
                  <span className="text-sm text-green-500">99.9%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "99.9%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Usage</span>
                  <span className="text-sm text-blue-500">42%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-amber-500">68%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "68%" }}></div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Latest System Updates</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">Database backup completed (12:45 AM)</li>
                  <li className="text-muted-foreground">System update deployed (Yesterday)</li>
                  <li className="text-muted-foreground">Security patches applied (3 days ago)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
