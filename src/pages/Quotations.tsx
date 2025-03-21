
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  FilePlus, 
  Download, 
  Mail,
  Eye,
  Filter,
  Calendar,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock quotations data
const mockQuotations = [
  {
    id: "Q-2023-001",
    customerName: "Acme Corporation",
    customerEmail: "procurement@acmecorp.com",
    customerPhone: "+91 98765 43210",
    customerAddress: "123 Business Park, Mumbai, Maharashtra, 400001",
    subtotal: 124500,
    gst: 22410,
    total: 146910,
    status: "Approved",
    createdAt: "2023-06-10T10:30:00"
  },
  {
    id: "Q-2023-002",
    customerName: "TechSolutions Inc.",
    customerEmail: "purchase@techsolutions.com",
    customerPhone: "+91 87654 32109",
    customerAddress: "456 IT Park, Bengaluru, Karnataka, 560001",
    subtotal: 85400,
    gst: 15372,
    total: 100772,
    status: "Pending",
    createdAt: "2023-06-08T14:15:00"
  },
  {
    id: "Q-2023-003",
    customerName: "Global Enterprises",
    customerEmail: "office@globalent.com",
    customerPhone: "+91 76543 21098",
    customerAddress: "789 Corporate Tower, Delhi, Delhi, 110001",
    subtotal: 153000,
    gst: 27540,
    total: 180540,
    status: "Approved",
    createdAt: "2023-06-05T09:45:00"
  },
  {
    id: "Q-2023-004",
    customerName: "Luxury Hotels Group",
    customerEmail: "procurement@luxuryhotels.com",
    customerPhone: "+91 65432 10987",
    customerAddress: "321 Hospitality Avenue, Chennai, Tamil Nadu, 600001",
    subtotal: 350000,
    gst: 63000,
    total: 413000,
    status: "Approved",
    createdAt: "2023-05-30T11:20:00"
  },
  {
    id: "Q-2023-005",
    customerName: "Metro Developers",
    customerEmail: "projects@metrodevelopers.com",
    customerPhone: "+91 54321 09876",
    customerAddress: "654 Construction House, Hyderabad, Telangana, 500001",
    subtotal: 275000,
    gst: 49500,
    total: 324500,
    status: "Rejected",
    createdAt: "2023-05-25T16:30:00"
  },
  {
    id: "Q-2023-006",
    customerName: "Royal Interiors",
    customerEmail: "designer@royalinteriors.com",
    customerPhone: "+91 43210 98765",
    customerAddress: "987 Design Street, Kolkata, West Bengal, 700001",
    subtotal: 192500,
    gst: 34650,
    total: 227150,
    status: "Pending",
    createdAt: "2023-05-20T13:10:00"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-amber-100 text-amber-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState(mockQuotations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortOrder, setSortOrder] = useState("newest");

  // Filter quotations based on search query, status, and date
  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = 
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || quote.status === statusFilter;
    
    // Date filtering
    if (dateFilter === "All Time") return matchesSearch && matchesStatus;
    
    const quoteDate = new Date(quote.createdAt);
    const now = new Date();
    
    if (dateFilter === "Today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return matchesSearch && matchesStatus && quoteDate >= today;
    }
    
    if (dateFilter === "This Week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return matchesSearch && matchesStatus && quoteDate >= oneWeekAgo;
    }
    
    if (dateFilter === "This Month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return matchesSearch && matchesStatus && quoteDate >= oneMonthAgo;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Sort quotations
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOrder === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortOrder === "highest") {
      return b.total - a.total;
    }
    if (sortOrder === "lowest") {
      return a.total - b.total;
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your quotations
          </p>
        </div>
        <div>
          <Link to="/quotations/new">
            <Button className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              <span>New Quotation</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
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

        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dateFilter}
            onValueChange={setDateFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Date Range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Time">All Time</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 ml-auto">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={sortOrder === "newest" ? "bg-muted" : ""}
                onClick={() => setSortOrder("newest")}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "oldest" ? "bg-muted" : ""}
                onClick={() => setSortOrder("oldest")}
              >
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={sortOrder === "highest" ? "bg-muted" : ""}
                onClick={() => setSortOrder("highest")}
              >
                Highest Amount
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "lowest" ? "bg-muted" : ""}
                onClick={() => setSortOrder("lowest")}
              >
                Lowest Amount
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quotations List */}
      {sortedQuotations.length > 0 ? (
        <div className="grid gap-4">
          {sortedQuotations.map((quote) => (
            <Card key={quote.id} className="overflow-hidden hover-lift">
              <CardHeader className="pb-0 pt-4 px-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>{quote.id}</CardTitle>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(quote.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/quotations/${quote.id}`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-3 px-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                    <div className="font-medium">{quote.customerName}</div>
                    <div className="text-sm mt-1">
                      <div>{quote.customerEmail}</div>
                      <div>{quote.customerPhone}</div>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h4>
                    <div className="text-sm">{quote.customerAddress}</div>
                  </div>
                  <div className="md:text-right">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Amount</h4>
                    <div className="font-bold text-lg">₹{quote.total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <div>Subtotal: ₹{quote.subtotal.toLocaleString()}</div>
                      <div>GST (18%): ₹{quote.gst.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No quotations found</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            Try adjusting your filters or create a new quotation.
          </p>
          <Link to="/quotations/new">
            <Button className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              <span>Create New Quotation</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;
