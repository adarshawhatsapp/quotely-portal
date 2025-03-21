
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash,
  SlidersHorizontal,
  ChevronDown
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Mock products data
const mockProducts = [
  {
    id: "1",
    name: "Crystal Chandelier",
    modelNumber: "CC-2023-01",
    category: "Chandelier",
    price: 45000,
    discountedPrice: 39999,
    image: "https://images.unsplash.com/photo-1543161949-1f9193812ce8?q=80&w=200&h=200&auto=format&fit=crop",
    description: "Luxury crystal chandelier with intricate design, perfect for large halls and reception areas.",
    customizations: ["Gold finish", "Silver finish", "Bronze finish"]
  },
  {
    id: "2",
    name: "Modern Pendant Light",
    modelNumber: "PL-2023-42",
    category: "Pendant",
    price: 12500,
    discountedPrice: 10999,
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=200&h=200&auto=format&fit=crop",
    description: "Sleek modern pendant light with adjustable height and brightness.",
    customizations: ["Black", "White", "Copper"]
  },
  {
    id: "3",
    name: "Wall Sconce Pair",
    modelNumber: "WS-2023-15",
    category: "Wall Light",
    price: 8500,
    discountedPrice: 7999,
    image: "https://images.unsplash.com/photo-1507465692364-fad85760a698?q=80&w=200&h=200&auto=format&fit=crop",
    description: "Elegant wall sconces sold as a pair, with warm ambient lighting effect.",
    customizations: ["Chrome", "Matte Black", "Brushed Nickel"]
  },
  {
    id: "4",
    name: "LED Ceiling Fixture",
    modelNumber: "LC-2023-08",
    category: "Ceiling",
    price: 18500,
    discountedPrice: 16499,
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=200&h=200&auto=format&fit=crop",
    description: "Energy-efficient LED ceiling fixture with color temperature adjustment.",
    customizations: ["Round", "Square", "Dimmable"]
  }
];

const ProductsPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("name-asc");
  
  // Product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    modelNumber: "",
    category: "",
    price: "",
    discountedPrice: "",
    image: "",
    description: "",
    customizations: ""
  });

  const categories = ["All", "Chandelier", "Pendant", "Wall Light", "Ceiling", "Table Lamp", "Floor Lamp"];

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.modelNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const [field, direction] = sortOrder.split("-");
    
    if (field === "name") {
      return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (field === "price") {
      return direction === "asc" 
        ? a.discountedPrice - b.discountedPrice 
        : b.discountedPrice - a.discountedPrice;
    }
    return 0;
  });

  const handleAddProduct = () => {
    const customizationsArray = newProduct.customizations
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
    
    const productToAdd = {
      id: `${products.length + 1}`,
      name: newProduct.name,
      modelNumber: newProduct.modelNumber,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      discountedPrice: parseFloat(newProduct.discountedPrice) || parseFloat(newProduct.price),
      image: newProduct.image || "https://via.placeholder.com/200",
      description: newProduct.description,
      customizations: customizationsArray
    };
    
    setProducts([...products, productToAdd]);
    
    // Reset form
    setNewProduct({
      name: "",
      modelNumber: "",
      category: "",
      price: "",
      discountedPrice: "",
      image: "",
      description: "",
      customizations: ""
    });
    
    setIsAddProductDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog for quotations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new product below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="Crystal Chandelier" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelNumber">Model Number</Label>
                    <Input 
                      id="modelNumber" 
                      value={newProduct.modelNumber}
                      onChange={(e) => setNewProduct({...newProduct, modelNumber: e.target.value})}
                      placeholder="CC-2023-01" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      placeholder="Chandelier" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input 
                      id="image" 
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      placeholder="https://example.com/image.jpg" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="45000" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                    <Input 
                      id="discountedPrice" 
                      type="number"
                      value={newProduct.discountedPrice}
                      onChange={(e) => setNewProduct({...newProduct, discountedPrice: e.target.value})}
                      placeholder="39999" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Luxury crystal chandelier with intricate design..." 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customizations">
                    Customizations (comma separated)
                  </Label>
                  <Input 
                    id="customizations" 
                    value={newProduct.customizations}
                    onChange={(e) => setNewProduct({...newProduct, customizations: e.target.value})}
                    placeholder="Gold finish, Silver finish, Bronze finish" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddProduct}>
                  Add Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{categoryFilter === "All" ? "All Categories" : categoryFilter}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categories.map((category) => (
                <DropdownMenuItem 
                  key={category}
                  className={categoryFilter === category ? "bg-muted" : ""}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover-lift">
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/80 text-primary font-medium backdrop-blur-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Model: {product.modelNumber}
                    </CardDescription>
                  </div>
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
              <CardContent className="p-4 pt-2">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-bold">₹{product.discountedPrice.toLocaleString()}</span>
                  {product.price !== product.discountedPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.customizations.slice(0, 3).map((custom, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {custom}
                    </Badge>
                  ))}
                  {product.customizations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.customizations.length - 3} more
                    </Badge>
                  )}
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
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
