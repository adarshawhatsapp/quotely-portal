
import { useState } from "react";
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
  AlertTriangle
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

// Mock spares data
const mockSpares = [
  {
    id: "SP001",
    name: "Crystal Droplet",
    price: 850,
    stock: 120,
  },
  {
    id: "SP002",
    name: "LED Bulb (Warm White)",
    price: 350,
    stock: 240,
  },
  {
    id: "SP003",
    name: "Pendant Cable (2m)",
    price: 550,
    stock: 85,
  },
  {
    id: "SP004",
    name: "Canopy Cover",
    price: 1200,
    stock: 48,
  },
  {
    id: "SP005",
    name: "Lamp Shade (Small)",
    price: 950,
    stock: 62,
  },
  {
    id: "SP006",
    name: "Lamp Shade (Large)",
    price: 1450,
    stock: 35,
  },
  {
    id: "SP007",
    name: "Dimmer Switch",
    price: 750,
    stock: 95,
  },
  {
    id: "SP008",
    name: "Ceiling Mount Kit",
    price: 1100,
    stock: 70,
  },
];

const SparesPage = () => {
  const [spares, setSpares] = useState(mockSpares);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [isAddSpareDialogOpen, setIsAddSpareDialogOpen] = useState(false);
  
  // Spare form state
  const [newSpare, setNewSpare] = useState({
    name: "",
    price: "",
    stock: ""
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

  const handleAddSpare = () => {
    const spareToAdd = {
      id: `SP${String(spares.length + 1).padStart(3, '0')}`,
      name: newSpare.name,
      price: parseFloat(newSpare.price),
      stock: parseInt(newSpare.stock, 10) || 0
    };
    
    setSpares([...spares, spareToAdd]);
    
    // Reset form
    setNewSpare({
      name: "",
      price: "",
      stock: ""
    });
    
    setIsAddSpareDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spare Parts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your spare parts inventory for quotations
          </p>
        </div>
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
                  <Label htmlFor="spare-name">Spare Part Name</Label>
                  <Input 
                    id="spare-name" 
                    value={newSpare.name}
                    onChange={(e) => setNewSpare({...newSpare, name: e.target.value})}
                    placeholder="Crystal Droplet" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spare-price">Price (₹)</Label>
                    <Input 
                      id="spare-price" 
                      type="number"
                      value={newSpare.price}
                      onChange={(e) => setNewSpare({...newSpare, price: e.target.value})}
                      placeholder="850" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spare-stock">Stock Quantity</Label>
                    <Input 
                      id="spare-stock" 
                      type="number"
                      value={newSpare.stock}
                      onChange={(e) => setNewSpare({...newSpare, stock: e.target.value})}
                      placeholder="120" 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddSpareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddSpare}>
                  Add Spare Part
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
      {sortedSpares.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedSpares.map((spare) => (
            <Card key={spare.id} className="overflow-hidden hover-lift">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{spare.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          <p className="text-muted-foreground mt-1">
            Try adjusting your search to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default SparesPage;
