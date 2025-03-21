
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ChevronDown,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getQuotations } from "@/services/quotationService";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch quotations
  const { data: quotations = [], isLoading, error } = useQuery({
    queryKey: ['quotations'],
    queryFn: getQuotations,
  });

  // Filter quotations based on search query, status, and date
  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = 
      quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.customer_email && quote.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === "All" || quote.status === statusFilter;
    
    // Date filtering
    if (dateFilter === "All Time") return matchesSearch && matchesStatus;
    
    const quoteDate = new Date(quote.created_at);
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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortOrder === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortOrder === "highest") {
      return b.total - a.total;
    }
    if (sortOrder === "lowest") {
      return a.total - b.total;
    }
    return 0;
  });

  const handleEmailQuotation = (id: string) => {
    toast.success("Email feature will be implemented soon");
  };

  const handleDownloadQuotation = (id: string) => {
    toast.success("Download feature will be implemented soon");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Quotations</h3>
        <p className="text-gray-500 mb-4">
          {(error as any).message || "Failed to load quotations. Please try again."}
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['quotations'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading quotations...</span>
        </div>
      ) : sortedQuotations.length > 0 ? (
        <div className="grid gap-4">
          {sortedQuotations.map((quote) => (
            <Card key={quote.id} className="overflow-hidden hover-lift">
              <CardHeader className="pb-0 pt-4 px-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>{quote.quote_number}</CardTitle>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(quote.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/quotations/${quote.id}`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleDownloadQuotation(quote.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleEmailQuotation(quote.id)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-3 px-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                    <div className="font-medium">{quote.customer_name}</div>
                    <div className="text-sm mt-1">
                      {quote.customer_email && <div>{quote.customer_email}</div>}
                      {quote.customer_phone && <div>{quote.customer_phone}</div>}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h4>
                    <div className="text-sm">{quote.customer_address || "No address provided"}</div>
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
            {searchQuery || statusFilter !== "All" || dateFilter !== "All Time"
              ? "Try adjusting your filters or create a new quotation."
              : "No quotations have been created yet."}
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
