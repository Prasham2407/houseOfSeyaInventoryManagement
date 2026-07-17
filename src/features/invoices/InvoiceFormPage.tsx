import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { extractErrorMessage } from '@/lib/apiClient';
import { Button, Card, CardBody, CardHeader, EmptyState, IconButton, Input, PageHeader, Select } from '@/components/ui';
import { useCustomers } from '@/features/customers/hooks';
import { useProducts } from '@/features/inventory/hooks';
import { useCreateInvoice } from './hooks';
import { currency } from './statusBadge';

interface DraftLine {
  productId: string;
  quantity: number;
}

export function InvoiceFormPage() {
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const createInvoice = useCreateInvoice();

  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const availableProducts = useMemo(
    () => products?.filter((p) => !lines.some((l) => l.productId === p.id)) ?? [],
    [products, lines],
  );

  const addLine = () => {
    if (availableProducts.length === 0) return;
    setLines((prev) => [...prev, { productId: availableProducts[0].id, quantity: 1 }]);
  };

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const productById = useMemo(() => new Map(products?.map((p) => [p.id, p])), [products]);

  const subtotal = lines.reduce((sum, l) => {
    const product = productById.get(l.productId);
    return sum + (product ? product.unitPrice * l.quantity : 0);
  }, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    setError(null);
    if (!customerId) {
      setError('Select a customer.');
      return;
    }
    if (lines.length === 0) {
      setError('Add at least one product line.');
      return;
    }
    for (const line of lines) {
      const product = productById.get(line.productId);
      if (product && line.quantity > product.quantityInStock) {
        setError(`Only ${product.quantityInStock} units of "${product.name}" are in stock.`);
        return;
      }
    }
    try {
      const invoice = await createInvoice.mutateAsync({
        customerId,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create invoice.'));
    }
  };

  return (
    <div>
      <PageHeader title="New invoice" description="Select a customer and add the products being billed." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Customer" />
            <CardBody>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select a customer…</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader
              title="Line items"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={addLine}
                  disabled={availableProducts.length === 0}
                  icon={<Plus className="h-3.5 w-3.5" strokeWidth={2} />}
                >
                  Add product
                </Button>
              }
            />
            <CardBody>
              {lines.length === 0 ? (
                <EmptyState title="No products added" description="Use “Add product” to start building this invoice." />
              ) : (
                <div className="flex flex-col gap-3">
                  {lines.map((line, index) => {
                    const product = productById.get(line.productId);
                    return (
                      <div key={index} className="grid grid-cols-12 items-end gap-3 rounded-lg border border-graphite-100 p-3">
                        <div className="col-span-6">
                          <Select
                            label="Product"
                            value={line.productId}
                            onChange={(e) => updateLine(index, { productId: e.target.value })}
                          >
                            <option value={line.productId}>{product?.name}</option>
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            label="Qty"
                            type="number"
                            min="1"
                            max={product?.quantityInStock}
                            value={line.quantity}
                            onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2 text-right text-sm text-graphite-500">
                          {product && (
                            <>
                              <p className="text-xs text-graphite-400">In stock: {product.quantityInStock}</p>
                              <p className="font-medium text-graphite-800">{currency(product.unitPrice * line.quantity)}</p>
                            </>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <IconButton label="Remove line item" tone="danger" onClick={() => removeLine(index)}>
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Summary" />
            <CardBody>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-graphite-500">Subtotal</dt>
                  <dd className="font-medium text-graphite-800">{currency(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-graphite-500">Tax (10%)</dt>
                  <dd className="font-medium text-graphite-800">{currency(tax)}</dd>
                </div>
                <div className="mt-1 flex justify-between border-t border-graphite-100 pt-2 text-base">
                  <dt className="font-semibold text-graphite-900">Total</dt>
                  <dd className="font-semibold text-graphite-900">{currency(total)}</dd>
                </div>
              </dl>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <Button className="mt-6 w-full" onClick={handleSubmit} isLoading={createInvoice.isPending}>
                Create draft invoice
              </Button>
              <p className="mt-2 text-center text-xs text-graphite-400">
                Stock is only deducted once the invoice is issued.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
