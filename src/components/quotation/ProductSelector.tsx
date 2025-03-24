
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, AlertCircle, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import { getSpares } from "@/services/spareService";
import { QuoteItem } from "@/services/quotationService";

interface Product {
  id: string;
  name: string;
  model_number?: string;
  price: number;
  description?: string;
  image?: string;
}

interface ProductSelectorProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: QuoteItem) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  open,
  onClose,
  onAddItem
}) => {
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [description, setDescription] = useState("");

  // Fetch products and spares
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: spares = [] } = useQuery({
    queryKey: ['spares'],
    queryFn: getSpares,
  });

  // Filter by search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.model_number && product.model_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSpares = spares.filter(spare =>
    spare.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spare.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle selection of an item
  const handleSelectItem = (item: Product) => {
    setSelectedItem(item);
    setDiscountedPrice(item.price);
    setDescription(item.description || "");
  };

  // Handle adding the item to the quote
  const handleAddItem = () => {
    if (!selectedItem) return;

    const newItem: QuoteItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      modelNumber: selectedItem.model_number || undefined,
      quantity: quantity,
      price: selectedItem.price,
      discountedPrice: discountedPrice,
      total: discountedPrice * quantity,
      image: selectedItem.image || null,
      type: activeTab === "products" ? "product" : "spare",
      description: description || null,
      customization: null
    };

    onAddItem(newItem);
    onClose();
    
    // Reset state
    setSelectedItem(null);
    setQuantity(1);
    setDiscountedPrice(0);
    setDescription("");
  };

  // Handle discount percentage change
  const handleDiscountPercentageChange = (percentage: number) => {
    if (!selectedItem) return;
    const newPrice = selectedItem.price * (1 - percentage / 100);
    setDiscountedPrice(Math.round(newPrice * 100) / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Items to Quotation</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden grid md:grid-cols-3 gap-4">
          {/* Left Panel: Search and Items List */}
          <div className="md:col-span-2 overflow-hidden flex flex-col">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or model..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="spares">Spare Parts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="flex-1 overflow-auto mt-2">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex border rounded-md p-3 cursor-pointer transition-colors ${
                          selectedItem?.id === product.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectItem(product)}
                      >
                        <div className="w-12 h-12 rounded bg-muted/50 overflow-hidden flex-shrink-0 mr-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          {product.model_number && (
                            <div className="text-xs text-muted-foreground">
                              Model: {product.model_number}
                            </div>
                          )}
                          <div className="text-sm font-medium mt-1">
                            ₹{product.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mb-2" />
                    <p>No products found</p>
                    {searchQuery && <p className="text-sm">Try a different search term</p>}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="spares" className="flex-1 overflow-auto mt-2">
                {filteredSpares.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredSpares.map((spare) => (
                      <div
                        key={spare.id}
                        className={`flex border rounded-md p-3 cursor-pointer transition-colors ${
                          selectedItem?.id === spare.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectItem(spare)}
                      >
                        <div>
                          <div className="font-medium text-sm">{spare.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {spare.id}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            ₹{spare.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {spare.stock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mb-2" />
                    <p>No spare parts found</p>
                    {searchQuery && <p className="text-sm">Try a different search term</p>}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Panel: Item Details */}
          <div className="border rounded-md p-4 overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="text-lg font-medium">{selectedItem.name}</div>
                
                {/* Original Price */}
                <div className="flex justify-between items-center">
                  <span className="text-sm">Original Price:</span>
                  <span className="font-medium">₹{selectedItem.price.toLocaleString()}</span>
                </div>
                
                {/* Discount Controls */}
                <div>
                  <div className="text-sm mb-1">Apply Discount:</div>
                  <div className="flex gap-1 flex-wrap">
                    {[0, 5, 10, 15, 20, 25, 30].map((percent) => (
                      <Button
                        key={percent}
                        type="button"
                        variant={discountedPrice === selectedItem.price * (1 - percent / 100) ? "default" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => handleDiscountPercentageChange(percent)}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Discounted Price Input */}
                <div>
                  <div className="text-sm mb-1">Discounted Price:</div>
                  <Input
                    type="number"
                    value={discountedPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        setDiscountedPrice(val);
                      }
                    }}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    max={selectedItem.price}
                  />
                  {discountedPrice < selectedItem.price && (
                    <div className="text-xs text-green-600 mt-1">
                      Discount: {((1 - discountedPrice / selectedItem.price) * 100).toFixed(1)}%
                      (₹{(selectedItem.price - discountedPrice).toLocaleString()})
                    </div>
                  )}
                </div>
                
                {/* Quantity Controls */}
                <div>
                  <div className="text-sm mb-1">Quantity:</div>
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setQuantity(val);
                        }
                      }}
                      className="h-9 rounded-none text-center w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <div className="text-sm mb-1">Description (optional):</div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[80px] p-2 text-sm border rounded-md"
                    placeholder="Enter any additional details about this item..."
                  />
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold">
                    ₹{(discountedPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No item selected</p>
                <p className="text-sm text-center mt-2">
                  Select a product or spare part from the list to customize and add to your quotation
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddItem} disabled={!selectedItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add to Quotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelector;
