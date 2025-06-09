
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { User, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, BulkCreateStudentData } from '@/types';
import { ActionType, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserFormData = Omit<CreateUserPayload, 'avatarUrl'> & { id?: string; confirmPassword?: string };

const initialUserFormData: UserFormData = {
  id: undefined,
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: UserRole.STUDENT,
};

export default function AdminUsersPage() {
  const { state, dispatch, handleBulkCreateStudents } = useAppContext();
  const { users, currentUser } = state;
  const { toast } = useToast();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>(initialUserFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isBulkCreating, setIsBulkCreating] = useState(false);


  const handleOpenAddUserModal = () => {
    setUserFormData(initialUserFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditUserModal = (user: User) => {
    setUserFormData({
      id: user.id,
      name: user.name,
      email: user.email, 
      role: user.role,
      password: '', 
      confirmPassword: '',
    });
    setIsEditUserModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setUserFormData(prev => ({ ...prev, role: value as UserRole }));
  };

  const validateForm = (): boolean => {
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      toast({ title: "Validation Error", description: "Name and Email are required.", variant: "destructive" });
      return false;
    }
    if (!userFormData.id) { 
        if (!userFormData.password) {
            toast({ title: "Validation Error", description: "Password is required for new users.", variant: "destructive" });
            return false;
        }
        if (userFormData.password !== userFormData.confirmPassword) {
            toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
            return false;
        }
    }
    if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
        toast({ title: "Validation Error", description: "Please enter a valid email address.", variant: "destructive" });
        return false;
    }
    return true;
  };

  const handleAddUserSubmit = () => {
    if (!validateForm()) return;

    const payload: CreateUserPayload = {
      name: userFormData.name,
      email: userFormData.email,
      password: userFormData.password,
      role: userFormData.role,
    };
    dispatch({ type: ActionType.CREATE_USER, payload });
    setIsAddUserModalOpen(false);
  };

  const handleEditUserSubmit = () => {
    if (!userFormData.id) return;
    if (!userFormData.name.trim()) {
         toast({ title: "Validation Error", description: "Name cannot be empty.", variant: "destructive" });
         return; // Changed from false to void
    }
    
    const payload: UpdateUserPayload = {
      id: userFormData.id,
      name: userFormData.name,
      role: userFormData.role,
    };
    dispatch({ type: ActionType.UPDATE_USER, payload });
    setIsEditUserModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      toast({ title: "Error", description: "You cannot delete your own account.", variant: "destructive" });
      setUserToDelete(null);
      return;
    }
    dispatch({ type: ActionType.DELETE_USER, payload: { id: userId } });
    setUserToDelete(null); 
  };

  const handleCsvFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  const handleProcessCsvUpload = async () => {
    if (!csvFile) {
      toast({ title: "No File", description: "Please select a CSV file to upload.", variant: "destructive" });
      return;
    }
    setIsBulkCreating(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "File Read Error", description: "Could not read the CSV file.", variant: "destructive" });
        setIsBulkCreating(false);
        return;
      }
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== ''); // Filter out empty lines
      if (lines.length < 2) {
        toast({ title: "Invalid CSV", description: "CSV file must have a header and at least one data row.", variant: "destructive" });
        setIsBulkCreating(false);
        return;
      }

      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const emailIndex = header.indexOf('email');
      const passwordIndex = header.indexOf('password');
      let nameIndex = header.indexOf('name');
      let firstNameIndex = header.indexOf('firstname');
      let lastNameIndex = header.indexOf('lastname');

      if (emailIndex === -1 || passwordIndex === -1) {
        toast({ title: "Invalid CSV Header", description: "CSV must contain 'email' and 'password' columns.", variant: "destructive" });
        setIsBulkCreating(false);
        return;
      }
      if (nameIndex === -1 && (firstNameIndex === -1 || lastNameIndex === -1)) {
        toast({ title: "Invalid CSV Header", description: "CSV must contain either a 'name' column or both 'firstname' and 'lastname' columns.", variant: "destructive" });
        setIsBulkCreating(false);
        return;
      }


      const studentsToCreate: BulkCreateStudentData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',').map(d => d.trim());
        const email = data[emailIndex];
        const password = data[passwordIndex];
        let name: string;

        if (nameIndex !== -1) {
          name = data[nameIndex];
        } else {
          // Construct name from firstname and lastname
          const firstName = data[firstNameIndex];
          const lastName = data[lastNameIndex];
          if (!firstName || !lastName) {
             toast({ title: "Row Error", description: `Row ${i + 1}: Missing firstname or lastname. Skipping.`, variant: "destructive" });
             continue;
          }
          name = `${firstName} ${lastName}`;
        }
        
        if (!name || !email || !password) {
          toast({ title: "Row Error", description: `Row ${i + 1}: Missing name, email, or password. Skipping.`, variant: "destructive" });
          continue;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          toast({ title: "Row Error", description: `Row ${i + 1}: Invalid email format for ${email}. Skipping.`, variant: "destructive" });
          continue;
        }
        studentsToCreate.push({ name, email, password });
      }

      if (studentsToCreate.length > 0) {
        await handleBulkCreateStudents(studentsToCreate);
      } else {
        toast({ title: "No Valid Students", description: "No valid student data found in the CSV to process.", variant: "default" });
      }
      setCsvFile(null); // Reset file input
      const fileInput = document.getElementById('csv-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setIsBulkCreating(false);
    };
    reader.onerror = () => {
        toast({ title: "File Read Error", description: "Error reading the CSV file contents.", variant: "destructive" });
        setIsBulkCreating(false);
    }
    reader.readAsText(csvFile);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Manage Users</h1>
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddUserModal}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account and assign a role.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={userFormData.name} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" value={userFormData.email} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password_add" className="text-right">Password</Label>
                <div className="col-span-3 relative">
                    <Input id="password_add" name="password" type={showPassword ? "text" : "password"} value={userFormData.password || ''} onChange={handleFormChange} />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword_add" className="text-right">Confirm Pwd</Label>
                 <div className="col-span-3 relative">
                    <Input id="confirmPassword_add" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={userFormData.confirmPassword || ''} onChange={handleFormChange} />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role_add" className="text-right">Role</Label>
                <Select value={userFormData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleAddUserSubmit}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Bulk Add Students via CSV</CardTitle>
            <CardDescription>
                Upload a CSV file with student data. Columns must include a header row with 'email', 'password', and either 'name' or both 'firstname' and 'lastname'. All users will be created with the 'Student' role.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="csv-upload-input">CSV File</Label>
                <Input 
                    id="csv-upload-input" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleCsvFileChange} 
                    className="mt-1"
                    disabled={isBulkCreating}
                />
            </div>
            <Button onClick={handleProcessCsvUpload} disabled={!csvFile || isBulkCreating} className="w-full sm:w-auto">
                {isBulkCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isBulkCreating ? "Processing..." : "Upload & Create Students"}
            </Button>
        </CardContent>
      </Card>


      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <img src={user.avatarUrl || `https://placehold.co/32x32.png?text=${user.name.substring(0,1)}`} alt={user.name} className="h-8 w-8 rounded-full" data-ai-hint="user avatar" />
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.role === UserRole.SUPER_ADMIN ? 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-200' :
                  user.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200' :
                  'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-200'
                }`}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog open={isEditUserModalOpen && userFormData.id === user.id} onOpenChange={(isOpen) => {
                    if (!isOpen) setIsEditUserModalOpen(false); else handleOpenEditUserModal(user);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditUserModal(user)}>
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Edit User: {userFormData.name}</DialogTitle>
                      <DialogDescription>Modify user details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                        <Input id="edit-name" name="name" value={userFormData.name} onChange={handleFormChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email" className="text-right">Email</Label>
                        <Input id="edit-email" name="email" type="email" value={userFormData.email} className="col-span-3" disabled />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-role" className="text-right">Role</Label>
                        <Select value={userFormData.role} onValueChange={handleRoleChange}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UserRole).map(role => (
                              <SelectItem key={role} value={role} disabled={currentUser?.id === user.id && role !== UserRole.SUPER_ADMIN && user.role === UserRole.SUPER_ADMIN}>
                                {role}
                                {currentUser?.id === user.id && role !== UserRole.SUPER_ADMIN && user.role === UserRole.SUPER_ADMIN && " (Cannot change own role from Super Admin)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>Cancel</Button></DialogClose>
                        <Button type="submit" onClick={handleEditUserSubmit} disabled={currentUser?.id === user.id && userFormData.role !== UserRole.SUPER_ADMIN && user.role === UserRole.SUPER_ADMIN}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog open={!!userToDelete && userToDelete.id === user.id} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setUserToDelete(user)} disabled={currentUser?.id === user.id}>
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for {userToDelete?.name}.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}>
                            Yes, delete user
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">No users found. Start by adding a new user.</p>
      )}
    </div>
  );
}

