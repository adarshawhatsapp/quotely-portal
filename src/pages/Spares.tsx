
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash,
  SlidersHorizontal,
  ChevronDown,
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSpares, createSpare, updateSpare, deleteSpare } from "@/services/spareService";
import { useAuth } from "@/context/AuthContext";

const SparesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [isAddSpareDialogOpen, setIsAddSpareDialogOpen] = useState(false);
  const [isEditSpareDialogOpen, setIsEditSpareDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSpare, setSelectedSpare] = useState<any>(null);
  
  // Spare form state
  const [spareForm, setSpareForm] = useState({
    name: "",
    price: "",
    stock: ""
  });

  // Fetch spares
  const { data: spares = [], isLoading, error } = useQuery({
    queryKey: ['spares'],
    queryFn: getSpares,
  });

  // Create spare mutation
  const createSpareMutation = useMutation({
    mutationFn: createSpare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      toast.success("Spare part created successfully");
      setIsAddSpareDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create spare part: ${error.message}`);
    }
  });

  // Update spare mutation
  const updateSpareMutation = useMutation({
    mutationFn: ({ id, spare }: { id: string, spare: any }) => 
      updateSpare(id, spare),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      toast.success("Spare part updated successfully");
      setIsEditSpareDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to update spare part: ${error.message}`);
    }
  });

  // Delete spare mutation
  const deleteSpareMutation = useMutation({
    mutationFn: deleteSpare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spares'] });
      toast.success("Spare part deleted successfully");
      setIsDeleteConfirmOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete spare part: ${error.message}`);
    }
  });

  // Filter spares based on search query
  const filteredSpares = spares.filter(spare =>
    spare.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spare.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort spares
  const sortedSpares = [...filteredSpares].sort((a, b) => {
    const [field, direction] = sortOrder.split("-");
    
    if (field === "name") {
      return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (field === "price") {
      return direction === "asc" ? a.price - b.price : b.price - a.price;
    } else if (field === "stock") {
      return direction === "asc" ? a.stock - b.stock : b.stock - a.stock;
    }
    return 0;
  });

  const resetForm = () => {
    setSpareForm({
      name: "",
      price: "",
      stock: ""
    });
    setSelectedSpare(null);
  };

  const handleOpenEditDialog = (spare: any) => {
    setSelectedSpare(spare);
    setSpareForm({
      name: spare.name,
      price: spare.price.toString(),
      stock: spare.stock.toString()
    });
    setIsEditSpareDialogOpen(true);
  };

  const handleOpenDeleteDialog = (spare: any) => {
    setSelectedSpare(spare);
    setIsDeleteConfirmOpen(true);
  };

  const handleAddSpare = () => {
    const spareToAdd = {
      name: spareForm.name,
      price: parseFloat(spareForm.price),
      stock: parseInt(spareForm.stock, 10) || 0
    };
    
    createSpareMutation.mutate(spareToAdd);
  };

  const handleUpdateSpare = () => {
    if (!selectedSpare) return;
    
    const spareToUpdate = {
      name: spareForm.name,
      price: parseFloat(spareForm.price),
      stock: parseInt(spareForm.stock, 10) || 0
    };
    
    updateSpareMutation.mutate({ 
      id: selectedSpare.id, 
      spare: spareToUpdate 
    });
  };

  const handleDeleteSpare = () => {
    if (!selectedSpare) return;
    deleteSpareMutation.mutate(selectedSpare.id);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Spare Parts</h3>
        <p className="text-gray-500 mb-4">
          {(error as any).message || "Failed to load spare parts. Please try again."}
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['spares'] })}
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
          <h1 className="text-3xl font-bold tracking-tight">Spare Parts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your spare parts inventory for quotations
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isAddSpareDialogOpen} onOpenChange={setIsAddSpareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Spare Part</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Spare Part</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new spare part below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="spare-name">Spare Part Name *</Label>
                    <Input 
                      id="spare-name" 
                      value={spareForm.name}
                      onChange={(e) => setSpareForm({...spareForm, name: e.target.value})}
                      placeholder="Crystal Droplet" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spare-price">Price (₹) *</Label>
                      <Input 
                        id="spare-price" 
                        type="number"
                        value={spareForm.price}
                        onChange={(e) => setSpareForm({...spareForm, price: e.target.value})}
                        placeholder="850" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spare-stock">Stock Quantity *</Label>
                      <Input 
                        id="spare-stock" 
                        type="number"
                        value={spareForm.stock}
                        onChange={(e) => setSpareForm({...spareForm, stock: e.target.value})}
                        placeholder="120" 
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm();
                    setIsAddSpareDialogOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddSpare}
                    disabled={createSpareMutation.isPending || !spareForm.name || !spareForm.price}
                  >
                    {createSpareMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : "Add Spare Part"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Edit Spare Dialog */}
      {isAdmin && (
        <Dialog open={isEditSpareDialogOpen} onOpenChange={setIsEditSpareDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Spare Part</DialogTitle>
              <DialogDescription>
                Update the details of the spare part below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-spare-name">Spare Part Name *</Label>
                <Input 
                  id="edit-spare-name" 
                  value={spareForm.name}
                  onChange={(e) => setSpareForm({...spareForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-spare-price">Price (₹) *</Label>
                  <Input 
                    id="edit-spare-price" 
                    type="number"
                    value={spareForm.price}
                    onChange={(e) => setSpareForm({...spareForm, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-spare-stock">Stock Quantity *</Label>
                  <Input 
                    id="edit-spare-stock" 
                    type="number"
                    value={spareForm.stock}
                    onChange={(e) => setSpareForm({...spareForm, stock: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                setIsEditSpareDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdateSpare}
                disabled={updateSpareMutation.isPending || !spareForm.name || !spareForm.price}
              >
                {updateSpareMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Update Spare Part"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this spare part? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedSpare && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{selectedSpare.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {selectedSpare.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{selectedSpare.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Stock: {selectedSpare.stock}</div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteSpare}
                disabled={deleteSpareMutation.isPending}
              >
                {deleteSpareMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : "Delete Spare Part"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search spare parts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={sortOrder === "name-asc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("name-asc")}
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "name-desc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("name-desc")}
              >
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={sortOrder === "price-asc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("price-asc")}
              >
                Price (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "price-desc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("price-desc")}
              >
                Price (High to Low)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={sortOrder === "stock-asc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("stock-asc")}
              >
                Stock (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem
                className={sortOrder === "stock-desc" ? "bg-muted" : ""}
                onClick={() => setSortOrder("stock-desc")}
              >
                Stock (High to Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Spares List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading spare parts...</span>
        </div>
      ) : sortedSpares.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedSpares.map((spare) => (
            <Card key={spare.id} className="overflow-hidden hover-lift">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{spare.name}</CardTitle>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(spare)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleOpenDeleteDialog(spare)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-4">
                  ID: {spare.id}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Price</div>
                    <div className="text-lg font-semibold">₹{spare.price.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Stock</div>
                    <div className={`flex items-center ${spare.stock < 50 ? "text-red-500" : ""}`}>
                      {spare.stock < 50 && <AlertTriangle className="h-4 w-4 mr-1" />}
                      <span className="text-lg font-semibold">{spare.stock}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full justify-center">
                    Add to Quote
                  </Button>
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
          <h3 className="text-lg font-medium">No spare parts found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery ? "Try adjusting your search to find what you're looking for." : "No spare parts have been added yet."}
          </p>
          {isAdmin && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddSpareDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Spare Part</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SparesPage;
