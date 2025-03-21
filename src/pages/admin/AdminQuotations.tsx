
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  FileText, 
  Search, 
  Eye, 
  Download, 
  Plus, 
  Trash,
  Loader2,
  Filter,
  Check,
  X,
  CalendarIcon,
  User
} from "lucide-react";
import {
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import { getQuotations, deleteQuotation, updateQuotationStatus, Quotation } from "@/services/quotationService";

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

const AdminQuotationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Fetch quotations
  const { data: quotations, isLoading, error } = useQuery({
    queryKey: ['quotations'],
    queryFn: getQuotations,
  });

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      setQuotationToDelete(null);
      toast.success("Quotation deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete quotation: ${error.message}`);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'Approved' | 'Pending' | 'Rejected' }) => 
      updateQuotationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success("Quotation status updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  // Filter quotations based on filters
  const filteredQuotations = quotations?.filter(quotation => {
    // Search filter
    const searchMatch = 
      !searchTerm ||
      quotation.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quotation.customer_email && quotation.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quotation.customer_phone && quotation.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const statusMatch = !statusFilter || quotation.status === statusFilter;
    
    // Date filter
    const dateMatch = !dateFilter || 
      format(new Date(quotation.created_at), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
    
    return searchMatch && statusMatch && dateMatch;
  });

  const handleDeleteQuotation = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleViewQuotation = (id: string) => {
    navigate(`/quotations/${id}`);
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setDateFilter(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading quotations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Quotations</h3>
        <p className="text-gray-500">{(error as any).message}</p>
        <Button 
          className="mt-4" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['quotations'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
        <Button onClick={() => navigate('/quotations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>View and manage customer quotations</CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <Filter className="h-4 w-4" />
                    {statusFilter ? `Status: ${statusFilter}` : "Filter Status"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                      <div className="flex items-center w-full justify-between">
                        Pending
                        {statusFilter === "Pending" && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Approved")}>
                      <div className="flex items-center w-full justify-between">
                        Approved
                        {statusFilter === "Approved" && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Rejected")}>
                      <div className="flex items-center w-full justify-between">
                        Rejected
                        {statusFilter === "Rejected" && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    <div className="flex items-center w-full">
                      Clear Filter
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PP") : "Filter Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {/* Clear Filters */}
              {(statusFilter || dateFilter) && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear all filters">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations && filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.quote_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{quotation.customer_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {quotation.customer_phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(quotation.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{quotation.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewQuotation(quotation.id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="More Options"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleViewQuotation(quotation.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuGroup>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(quotation.id, 'Pending')}
                                disabled={quotation.status === 'Pending'}
                              >
                                <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(quotation.id, 'Approved')}
                                disabled={quotation.status === 'Approved'}
                              >
                                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(quotation.id, 'Rejected')}
                                disabled={quotation.status === 'Rejected'}
                              >
                                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setQuotationToDelete(quotation.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm || statusFilter || dateFilter 
                      ? "No quotations match your search/filters" 
                      : "No quotations found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Quotation Dialog */}
      <AlertDialog open={!!quotationToDelete} onOpenChange={() => setQuotationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this quotation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => quotationToDelete && handleDeleteQuotation(quotationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminQuotationsPage;
