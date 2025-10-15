import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, Trash2, CheckCircle2, Plus, ArrowLeft, Gavel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminQuickSales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['/api/admin/quick-sales'],
    queryFn: async () => {
      const resp = await fetch('/api/admin/quick-sales', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!resp.ok) throw new Error('Failed to fetch quick sales');
      return resp.json();
    },
    enabled: !!adminToken,
  });

  const { mutate: setActive, isPending: settingActive } = useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch(`/api/admin/quick-sales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'active' })
      });
      if (!resp.ok) throw new Error('Failed to set active');
      return resp.json();
    },
    onSuccess: () => {
      toast({ title: 'Status Updated', description: 'Quick sale set to Active.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quick-sales'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to set status', variant: 'destructive' }),
  });

  const { mutate: finalizeSale, isPending: finalizing } = useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch(`/api/admin/quick-sales/${id}/finalize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!resp.ok) throw new Error('Failed to finalize quick sale');
      return resp.json();
    },
    onSuccess: () => {
      toast({ title: 'Finalized', description: 'Quick sale has been finalized.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quick-sales'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to finalize quick sale', variant: 'destructive' }),
  });

  const { mutate: deleteSale, isPending: deleting } = useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch(`/api/admin/quick-sales/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!resp.ok) throw new Error('Failed to delete quick sale');
      return resp.json();
    },
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Quick sale deleted.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quick-sales'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete quick sale', variant: 'destructive' }),
  });

  const viewSale = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin/quick-sales/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setSelected(data);
      setViewOpen(true);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load sale details', variant: 'destructive' });
    }
  };

  const openEdit = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin/quick-sales/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setEditData({
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        seller_name: data.seller_name || '',
        seller_contact: data.seller_contact || '',
        seller_email: data.seller_email || '',
        reserve_price: data.reserve_price || '',
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString().slice(0,16) : '',
        status: data.status || 'active',
      });
      setEditOpen(true);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load sale for editing', variant: 'destructive' });
    }
  };

  const submitEdit = async () => {
    if (!editData || !editData.id) return;
    try {
      setSaving(true);
      const body: any = {
        title: editData.title,
        description: editData.description,
        seller_name: editData.seller_name,
        seller_contact: editData.seller_contact,
        seller_email: editData.seller_email,
        reserve_price: editData.reserve_price,
        ends_at: editData.ends_at ? new Date(editData.ends_at).toISOString() : null,
        status: editData.status,
      };
      const resp = await fetch(`/api/admin/quick-sales/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error('Failed to update');
      toast({ title: 'Saved', description: 'Quick sale updated successfully' });
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quick-sales'] });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update quick sale', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ktu-grey p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ktu-deep-blue mb-2">Quick Sales Management</h1>
            <p className="text-ktu-dark-grey">Manage live auctions and quick sales</p>
          </div>
          <div className="space-x-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </Link>
            <Link href="/quick-sale/create">
              <Button className="bg-ktu-orange hover:bg-ktu-orange-light inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" /> New Quick Sale
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div>Loading quick sales...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sales.map((sale: any) => {
              const endsAt = sale.ends_at ? new Date(sale.ends_at) : null;
              const statusColor = sale.status === 'active' ? 'border-green-500 text-green-700' : sale.status === 'ended' ? 'border-gray-400 text-gray-600' : 'border-red-500 text-red-600';
              return (
                <Card key={sale.id} className="ktu-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-ktu-deep-blue mb-2">{sale.title}</CardTitle>
                        <Badge variant="outline" className={`mb-2 capitalize ${statusColor}`}>{sale.status}</Badge>
                      </div>
                      <div className="text-right text-sm text-ktu-dark-grey">
                        <div>Items: {sale.products_count ?? 0}</div>
                        <div>Bids: {sale.bids_count ?? 0}</div>
                        <div>Highest: {sale.highest_bid ? `₵${sale.highest_bid}` : '—'}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-ktu-dark-grey mb-3 line-clamp-3">{sale.description}</p>
                    <div className="text-xs text-gray-500 mb-4">
                      {endsAt ? `Ends: ${endsAt.toLocaleString()}` : ''}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => viewSale(sale.id)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(sale.id)}>
                        Edit
                      </Button>
                      {sale.status !== 'active' && (
                        <Button size="sm" variant="outline" disabled={settingActive} onClick={() => setActive(sale.id)}>
                          {settingActive ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                          Set Active
                        </Button>
                      )}
                      {sale.status === 'active' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={finalizing} onClick={() => finalizeSale(sale.id)}>
                          {finalizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-1" />}
                          Finalize
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" disabled={deleting} onClick={() => deleteSale(sale.id)}>
                        {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Quick Sale</DialogTitle>
          </DialogHeader>
          {!editData ? (
            <div className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="qs-title">Title</Label>
                <Input id="qs-title" value={editData.title} onChange={(e) => setEditData((p:any)=>({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="qs-description">Description</Label>
                <Textarea id="qs-description" rows={4} value={editData.description} onChange={(e) => setEditData((p:any)=>({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qs-seller-name">Seller Name</Label>
                  <Input id="qs-seller-name" value={editData.seller_name} onChange={(e) => setEditData((p:any)=>({ ...p, seller_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="qs-seller-contact">Seller Contact</Label>
                  <Input id="qs-seller-contact" value={editData.seller_contact} onChange={(e) => setEditData((p:any)=>({ ...p, seller_contact: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qs-seller-email">Seller Email</Label>
                  <Input id="qs-seller-email" type="email" value={editData.seller_email} onChange={(e) => setEditData((p:any)=>({ ...p, seller_email: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="qs-ends-at">Ends At</Label>
                  <Input id="qs-ends-at" type="datetime-local" value={editData.ends_at} onChange={(e) => setEditData((p:any)=>({ ...p, ends_at: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qs-reserve">Reserve Price (₵)</Label>
                  <Input id="qs-reserve" type="number" step="0.01" value={editData.reserve_price} onChange={(e) => setEditData((p:any)=>({ ...p, reserve_price: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="qs-status">Status</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData((p:any)=>({ ...p, status: v }))}>
                    <SelectTrigger id="qs-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={submitEdit} disabled={saving} className="bg-ktu-orange hover:bg-ktu-orange-light">
                  {saving ? <span className="inline-flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</span> : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Sale Details</DialogTitle>
          </DialogHeader>
          {!selected ? (
            <div className="py-8 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-ktu-deep-blue">{selected.title}</div>
                <div className="text-sm text-ktu-dark-grey">{selected.description}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Seller</Label>
                  <div className="text-sm">{selected.seller_name} • {selected.seller_contact}</div>
                </div>
                <div>
                  <Label>End Time</Label>
                  <div className="text-sm">{selected.ends_at ? new Date(selected.ends_at).toLocaleString() : '—'}</div>
                </div>
              </div>
              <div>
                <Label>Products</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {selected.products?.map((p: any) => (
                    <div key={p.id} className="border rounded p-3">
                      <div className="font-medium text-ktu-deep-blue">{p.title}</div>
                      <div className="text-sm text-ktu-dark-grey line-clamp-2">{p.description}</div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">Condition: {p.condition}</div>
                    </div>
                  ))}
                  {(!selected.products || selected.products.length === 0) && (
                    <div className="text-sm text-ktu-dark-grey">No products added.</div>
                  )}
                </div>
              </div>
              <div>
                <Label>Bids</Label>
                <div className="divide-y border rounded">
                  {selected.bids?.map((b: any) => (
                    <div key={b.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-ktu-deep-blue">{b.bidder_name}</div>
                        <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleString()}</div>
                      </div>
                      <div className="font-semibold">₵{b.bid_amount}</div>
                    </div>
                  ))}
                  {(!selected.bids || selected.bids.length === 0) && (
                    <div className="p-4 text-sm text-ktu-dark-grey">No bids placed yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
