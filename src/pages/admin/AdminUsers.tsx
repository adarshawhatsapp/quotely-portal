
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
import { 
  Search,
  UserPlus,
  Shield,
  ShieldAlert,
  Trash,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAllProfiles, promoteToAdmin, demoteToUser } from "@/services/userService";

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getAllProfiles,
  });

  // Promote user mutation
  const promoteUserMutation = useMutation({
    mutationFn: promoteToAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User promoted to admin successfully");
      setIsPromoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to promote user: ${error.message}`);
    }
  });

  // Demote admin mutation
  const demoteUserMutation = useMutation({
    mutationFn: demoteToUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Admin demoted to regular user successfully");
      setIsDemoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to demote admin: ${error.message}`);
    }
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePromoteUser = (user: any) => {
    setSelectedUser(user);
    setIsPromoteDialogOpen(true);
  };

  const handleDemoteUser = (user: any) => {
    setSelectedUser(user);
    setIsDemoteDialogOpen(true);
  };

  const confirmPromoteUser = () => {
    if (!selectedUser) return;
    promoteUserMutation.mutate(selectedUser.id);
  };

  const confirmDemoteUser = () => {
    if (!selectedUser) return;
    demoteUserMutation.mutate(selectedUser.id);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Users</h3>
        <p className="text-gray-500 mb-4">
          {(error as any).message || "Failed to load users. Please try again."}
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex items-center gap-2" disabled>
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Promote Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote this user to admin? 
              Admins have full access to manage products, spares, and all quotations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center p-3 border rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Role: User</div>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmPromoteUser}
              disabled={promoteUserMutation.isPending}
            >
              {promoteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Promoting...
                </>
              ) : "Promote to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Dialog */}
      <Dialog open={isDemoteDialogOpen} onOpenChange={setIsDemoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demote to User</DialogTitle>
            <DialogDescription>
              Are you sure you want to demote this admin to a regular user? 
              They will no longer have permission to manage products or view all quotations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center p-3 border rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Role: Admin</div>
                </div>
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDemoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDemoteUser}
              disabled={demoteUserMutation.isPending}
            >
              {demoteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Demoting...
                </>
              ) : "Demote to User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading users...</span>
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Name</th>
                    <th className="text-left py-3 font-medium">Created</th>
                    <th className="text-left py-3 font-medium">Role</th>
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{user.name}</div>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Badge
                          className={user.role === 'admin' ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-800"}
                        >
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === 'user' && (
                              <DropdownMenuItem onClick={() => handlePromoteUser(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Promote to Admin</span>
                              </DropdownMenuItem>
                            )}
                            {user.role === 'admin' && (
                              <DropdownMenuItem onClick={() => handleDemoteUser(user)}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                <span>Demote to User</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
