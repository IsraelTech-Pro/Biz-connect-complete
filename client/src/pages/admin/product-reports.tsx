import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ReportRow {
  id: string;
  product_id: string;
  reporter_email: string;
  reason: string;
  notes?: string | null;
  resolved: boolean;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  product_title?: string;
  product_status?: string;
  product_price?: number;
  product_image_url?: string;
  vendor_id?: string;
  vendor_name?: string;
  vendor_business?: string;
  vendor_phone?: string;
  vendor_whatsapp?: string;
}

export default function AdminProductReports() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState<ReportRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('admin_token'));
  }, []);

  const { data: reports = [], isLoading, refetch } = useQuery<ReportRow[]>({
    queryKey: ['/api/admin/product-reports'],
    queryFn: async () => {
      const resp = await fetch('/api/admin/product-reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!resp.ok) throw new Error('Failed to load product reports');
      return resp.json();
    },
    enabled: !!token
  });

  const resolveReport = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin/product-reports/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ resolution_notes: 'Resolved by admin' })
      });
      if (!resp.ok) throw new Error('Resolve failed');
      toast({ title: 'Report resolved' });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to resolve', variant: 'destructive' });
    }
  };

  const viewReport = async (id: string) => {
    setViewLoading(true);
    setViewData(null);
    setViewOpen(true);
    try {
      const resp = await fetch(`/api/admin/product-reports/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch report');
      const data = await resp.json();
      setViewData(data);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load report', variant: 'destructive' });
    } finally {
      setViewLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      const resp = await fetch(`/api/admin/product-reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!resp.ok) throw new Error('Delete failed');
      toast({ title: 'Report deleted' });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-ktu-grey py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ktu-deep-blue">Product Reports</h1>
          <Link href="/admin/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-ktu-deep-blue">Reported Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-gray-500">No product reports.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Business</th>
                      <th className="py-2 pr-4">Reporter</th>
                      <th className="py-2 pr-4">Reason</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="py-2 pr-4">
                          <div className="flex items-center space-x-3">
                            {r.product_image_url && (
                              <img src={r.product_image_url} alt="" className="w-10 h-10 object-cover rounded" />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{r.product_title || '—'}</div>
                              <div className="text-xs text-gray-500">#{r.product_id?.slice(0, 8)}</div>
                              <div className="text-xs text-gray-500">₵{r.product_price ?? 0}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="text-gray-900">{r.vendor_business || '—'}</div>
                          <div className="text-xs text-gray-500">{r.vendor_name || ''}</div>
                          <div className="text-xs text-gray-400">{r.vendor_phone || r.vendor_whatsapp || ''}</div>
                        </td>
                        <td className="py-2 pr-4">{r.reporter_email}</td>
                        <td className="py-2 pr-4">
                          <div className="text-gray-900">{r.reason}</div>
                          {r.notes && <div className="text-xs text-gray-500">{r.notes}</div>}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge className={r.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {r.resolved ? 'Resolved' : 'Pending'}
                          </Badge>
                          {r.resolution_notes && (
                            <div className="text-xs text-gray-500 mt-1">{r.resolution_notes}</div>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => viewReport(r.id)}>View</Button>
                            {!r.resolved && (
                              <Button size="sm" onClick={() => resolveReport(r.id)}>Resolve</Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => deleteReport(r.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
