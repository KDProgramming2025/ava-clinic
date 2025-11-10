import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, UserPlus, MoreVertical, Edit, Trash2, KeyRound, Lock, Unlock, Search, Filter } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useAdmin } from '../AdminContext';

interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  role: AdminRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type AdminRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export function AdminUsersManagement() {
  const { role: currentRole } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | AdminRole>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<{ email: string; name: string; role: AdminRole; password: string; active: boolean }>({ email: '', name: '', role: 'VIEWER', password: '', active: true });
  const [resetPassword, setResetPassword] = useState('');

  const canManage = currentRole === 'SUPERADMIN' || currentRole === 'ADMIN';

  const debouncedSearch = useMemo(() => {
    let t: any; return (v: string, cb: (val: string) => void) => { clearTimeout(t); t = setTimeout(() => cb(v), 300); };
  }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const data = await apiFetch<AdminUser[]>('/admin-users');
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load admin users');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => {
    const matchesRole = filterRole === 'all' ? true : u.role === filterRole;
    const q = search.toLowerCase();
    const matchesSearch = !q || [u.email, u.name || '', u.role].some(v => v.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const openCreate = () => { setEditing(null); setForm({ email: '', name: '', role: 'VIEWER', password: '', active: true }); setResetPassword(''); setDialogOpen(true); };
  const openEdit = (u: AdminUser) => { setEditing(u); setForm({ email: u.email, name: u.name || '', role: u.role, password: '', active: u.active }); setResetPassword(''); setDialogOpen(true); };

  const save = async () => {
    try {
      if (!form.email.trim()) { toast.error('Email required'); return; }
      if (!editing && !form.password.trim()) { toast.error('Password required'); return; }
      if (editing) {
        const body: any = { name: form.name || null, role: form.role, active: form.active };
        if (resetPassword.trim()) body.password = resetPassword.trim();
        const updated = await apiFetch<AdminUser>(`/admin-users/${editing.id}`, { method: 'PUT', body });
        setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
        toast.success('Admin user updated');
      } else {
        const created = await apiFetch<AdminUser>('/admin-users', { method: 'POST', body: { email: form.email.trim(), password: form.password.trim(), name: form.name.trim() || undefined, role: form.role } });
        setUsers(prev => [created, ...prev]);
        toast.success('Admin user created');
      }
      setDialogOpen(false);
    } catch (e: any) {
      if (e.code === 'email_exists') toast.error('Email already exists'); else toast.error(e?.message || 'Save failed');
    }
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(`Delete admin user ${u.email}?`)) return;
    try {
      await apiFetch(`/admin-users/${u.id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(x => x.id !== u.id));
      toast.success('Admin user deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  useEffect(() => { debouncedSearch(search, v => setSearch(v)); }, [search, debouncedSearch]);

  const roleBadge = (r: AdminRole) => {
    switch (r) {
      case 'SUPERADMIN': return 'bg-red-100 text-red-700';
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'EDITOR': return 'bg-blue-100 text-blue-700';
      case 'VIEWER': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Access Control</h1>
          <p className="text-gray-600">Manage admin users & roles</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin User
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{label:'Total', value: users.length, color:'from-pink-500 to-rose-600'},{label:'Active', value: users.filter(u=>u.active).length, color:'from-green-500 to-emerald-600'},{label:'Inactive', value: users.filter(u=>!u.active).length, color:'from-gray-500 to-gray-700'},{label:'Superadmins', value: users.filter(u=>u.role==='SUPERADMIN').length, color:'from-red-500 to-red-700'}].map((stat,i)=>(
          <motion.div key={stat.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
            <Card className="p-4 border-0 shadow-lg">
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4 border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Search email, name, role..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <Select value={filterRole} onValueChange={(v: 'all' | AdminRole)=>setFilterRole(v)}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="SUPERADMIN">Superadmins</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="EDITOR">Editors</SelectItem>
              <SelectItem value="VIEWER">Viewers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u,i)=>(
                <motion.tr key={u.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{u.email}</TableCell>
                  <TableCell>{u.name || '—'}</TableCell>
                  <TableCell><Badge className={roleBadge(u.role)}>{u.role}</Badge></TableCell>
                  <TableCell>{u.active ? <span className="text-green-600 flex items-center"><Unlock className="w-4 h-4 mr-1"/>Active</span> : <span className="text-gray-500 flex items-center"><Lock className="w-4 h-4 mr-1"/>Inactive</span>}</TableCell>
                  <TableCell className="text-gray-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManage && <DropdownMenuItem onClick={()=>openEdit(u)}><Edit className="w-4 h-4 mr-2"/>Edit</DropdownMenuItem>}
                        {canManage && <DropdownMenuItem onClick={()=>deleteUser(u)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Admin User' : 'Add Admin User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="rounded-xl" />
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Name</label>
              <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Role</label>
              <Select value={form.role} onValueChange={(v: AdminRole)=>setForm({...form,role:v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Status</span>
                <div className="mt-1">{form.active ? <Badge className="bg-green-100 text-green-700">Active</Badge> : <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>}</div>
              </div>
              <Button variant="outline" onClick={()=>setForm({...form,active:!form.active})} className="rounded-xl">{form.active ? <Lock className="w-4 h-4 mr-2"/> : <Unlock className="w-4 h-4 mr-2"/>}{form.active ? 'Deactivate' : 'Activate'}</Button>
            </div>
            {!editing && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Initial Password</label>
                <Input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="rounded-xl" />
              </div>
            )}
            {editing && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Reset Password (optional)</label>
                <Input type="password" value={resetPassword} onChange={e=>setResetPassword(e.target.value)} className="rounded-xl" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={()=>setDialogOpen(false)}>Cancel</Button>
            {canManage && (
              <Button onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                {editing ? 'Save Changes' : 'Create User'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsersManagement;
