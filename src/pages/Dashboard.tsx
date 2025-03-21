
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  FileText, 
  Clock, 
  TrendingUp, 
  FilePlus,
  ArrowRight,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for recent quotations
  const recentQuotations = [
    {
      id: "Q-2023-001",
      customer: "Acme Corporation",
      date: "2023-06-10",
      amount: 12500.00,
      status: "Approved"
    },
    {
      id: "Q-2023-002",
      customer: "TechSolutions Inc.",
      date: "2023-06-08",
      amount: 8750.00,
      status: "Pending"
    },
    {
      id: "Q-2023-003",
      customer: "Global Enterprises",
      date: "2023-06-05",
      amount: 15300.00,
      status: "Approved"
    },
  ];

  // Stats data
  const stats = [
    {
      title: "Total Products",
      value: "156",
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Recent Quotations",
      value: "32",
      description: "This month",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Quotes",
      value: "8",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Revenue (Est.)",
      value: "₹345,200",
      description: "From approved quotes",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your quotations today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/quotations/new">
            <Button className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              <span>New Quotation</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent Quotations */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Quotations</CardTitle>
                <CardDescription>View and manage your recent quotations</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search quotations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotations.map((quote, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{quote.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{quote.customer}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(quote.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ₹{quote.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quote.status === "Approved" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <Link to={`/quotations/${quote.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing <strong>3</strong> of <strong>32</strong> quotations
            </p>
            <Link to="/quotations">
              <Button variant="outline" size="sm" className="gap-1">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </section>

      {/* Quick actions */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Product Management</CardTitle>
            <CardDescription>Add, edit and organize products</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/products" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>Go to Products</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Create New Quote</CardTitle>
            <CardDescription>Generate a new quotation</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/quotations/new" className="w-full">
              <Button className="w-full justify-between">
                <span>Create Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Spare Parts</CardTitle>
            <CardDescription>Manage spare parts inventory</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/spares" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>Go to Spares</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
